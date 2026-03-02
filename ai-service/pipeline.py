"""
Digital Darzi Try-On Pipeline

CPU mode  → rembg ×2 → silhouette landmarks → TPS cloth warp → arm restoration
GPU mode  → rembg → CatVTON-FLUX → GFPGAN → Real-ESRGAN

TPS (Thin Plate Spline) cloth warping is inspired by HR-VITON / VITON-HD:
  - Detect body control points from the person silhouette mask
  - Detect matching control points on the flat-lay garment mask
  - Compute the TPS backward-warp (output space → garment space)
  - Sample garment with bilinear interpolation → pixel-accurate warp
  - Restore arm / face pixels on top for a natural "worn" look
"""

import io
import time
import logging
from pathlib import Path
from typing import Callable, Optional

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from models import GPU_MODE, get_rembg_session, get_flux_pipeline, get_gfpgan, get_realesrgan

logger = logging.getLogger(__name__)

NEXT_PUBLIC_DIR = Path(__file__).parent.parent / "public"


# ─────────────────────────────────────────────────────────────────────────────
# Shared utilities
# ─────────────────────────────────────────────────────────────────────────────

def load_image_from_url_or_path(path_or_url: str) -> Image.Image:
    if path_or_url.startswith("http"):
        import urllib.request
        with urllib.request.urlopen(path_or_url) as r:
            return Image.open(io.BytesIO(r.read())).convert("RGBA")
    p = NEXT_PUBLIC_DIR / path_or_url.lstrip("/") if path_or_url.startswith("/") else NEXT_PUBLIC_DIR / path_or_url
    return Image.open(p).convert("RGBA")


def remove_bg(image: Image.Image) -> Image.Image:
    try:
        from rembg import remove
        return remove(image.convert("RGBA"), session=get_rembg_session())
    except Exception as e:
        logger.warning(f"rembg failed: {e}")
        return image.convert("RGBA")


def crop_to_content(img: Image.Image) -> Image.Image:
    """Trim fully-transparent padding so the garment fills its bounding box."""
    a = np.array(img)[:, :, 3]
    rs = np.any(a > 10, axis=1)
    cs = np.any(a > 10, axis=0)
    if not rs.any() or not cs.any():
        return img
    r0, r1 = int(np.where(rs)[0][0]), int(np.where(rs)[0][-1])
    c0, c1 = int(np.where(cs)[0][0]), int(np.where(cs)[0][-1])
    return img.crop((c0, r0, c1 + 1, r1 + 1))


# ─────────────────────────────────────────────────────────────────────────────
# Pure-numpy Thin Plate Spline (no scipy required)
# ─────────────────────────────────────────────────────────────────────────────

def _tps_kernel(r2: np.ndarray) -> np.ndarray:
    with np.errstate(divide="ignore", invalid="ignore"):
        return np.where(r2 > 0, r2 * np.log(np.clip(r2, 1e-12, None)), 0.0)


def tps_fit(ctrl_src: np.ndarray, ctrl_dst: np.ndarray) -> dict:
    """
    Fit a TPS that maps ctrl_src → ctrl_dst.
    ctrl_src / ctrl_dst : (N, 2)  float64  (x, y)

    Returns params dict that can be passed to tps_eval.
    """
    n = len(ctrl_src)

    d = ctrl_src[:, None] - ctrl_src[None]          # (n, n, 2)
    r2 = (d ** 2).sum(axis=2)                        # (n, n)
    K = _tps_kernel(r2)

    P = np.hstack([np.ones((n, 1), dtype=np.float64), ctrl_src])   # (n, 3)

    L = np.zeros((n + 3, n + 3), dtype=np.float64)
    L[:n, :n] = K
    L[:n, n:] = P
    L[n:, :n] = P.T
    # Regularise slightly for numerical stability
    L[:n, :n] += np.eye(n) * 1e-6

    def _solve(rhs):
        return np.linalg.lstsq(L, rhs, rcond=None)[0]

    sol_x = _solve(np.r_[ctrl_dst[:, 0], np.zeros(3)])
    sol_y = _solve(np.r_[ctrl_dst[:, 1], np.zeros(3)])

    return dict(W_x=sol_x[:n], a_x=sol_x[n:],
                W_y=sol_y[:n], a_y=sol_y[n:],
                ctrl_src=ctrl_src)


def tps_eval(params: dict, query: np.ndarray, chunk: int = 65536) -> np.ndarray:
    """
    Evaluate TPS at query points.
    query  : (M, 2)  (x, y) in the source space of ctrl_src
    Returns: (M, 2)  mapped (x, y) in the destination space of ctrl_dst
    """
    ctrl = params["ctrl_src"]
    W_x, a_x = params["W_x"], params["a_x"]
    W_y, a_y = params["W_y"], params["a_y"]
    M = len(query)
    out = np.zeros((M, 2), dtype=np.float64)

    for i in range(0, M, chunk):
        q = query[i: i + chunk]
        d = q[:, None] - ctrl[None]           # (batch, n, 2)
        r2 = (d ** 2).sum(axis=2)             # (batch, n)
        K = _tps_kernel(r2)                   # (batch, n)
        P = np.hstack([np.ones((len(q), 1)), q])   # (batch, 3)
        out[i: i + chunk, 0] = K @ W_x + P @ a_x
        out[i: i + chunk, 1] = K @ W_y + P @ a_y

    return out


def warp_image_tps(src_img: Image.Image,
                   src_pts: np.ndarray,
                   dst_pts: np.ndarray,
                   out_size: tuple) -> Image.Image:
    """
    Warp src_img so that src_pts map to dst_pts in the output (backward warp).
    src_pts  : (N, 2) control points in src_img space
    dst_pts  : (N, 2) corresponding points in output image space
    out_size : (width, height)

    Backward warp: for each output pixel p_out, find the source pixel p_src.
    We fit TPS:  dst_pts → src_pts  (output space → source space).
    """
    ow, oh = out_size
    src_arr = np.array(src_img)
    sh, sw = src_arr.shape[:2]

    # TPS: output coords → source coords
    params = tps_fit(ctrl_src=dst_pts.astype(np.float64),
                     ctrl_dst=src_pts.astype(np.float64))

    # Build output pixel grid (x, y)
    gy, gx = np.meshgrid(np.arange(oh), np.arange(ow), indexing="ij")
    grid = np.stack([gx.ravel().astype(np.float64),
                     gy.ravel().astype(np.float64)], axis=1)  # (oh*ow, 2)

    # Map to source coordinates
    src_coords = tps_eval(params, grid)          # (oh*ow, 2) → (src_x, src_y)
    sx = src_coords[:, 0].reshape(oh, ow)
    sy = src_coords[:, 1].reshape(oh, ow)

    # Out-of-bounds mask
    oob = (sx < 0) | (sx >= sw) | (sy < 0) | (sy >= sh)

    sx_c = np.clip(sx, 0, sw - 1)
    sy_c = np.clip(sy, 0, sh - 1)

    # Bilinear interpolation
    x0 = np.floor(sx_c).astype(np.int32)
    y0 = np.floor(sy_c).astype(np.int32)
    x1 = np.minimum(x0 + 1, sw - 1)
    y1 = np.minimum(y0 + 1, sh - 1)
    wx = (sx_c - x0).astype(np.float32)
    wy = (sy_c - y0).astype(np.float32)

    warped = np.zeros((oh, ow, 4), dtype=np.uint8)
    for c in range(4):
        v00 = src_arr[y0, x0, c].astype(np.float32)
        v10 = src_arr[y1, x0, c].astype(np.float32)
        v01 = src_arr[y0, x1, c].astype(np.float32)
        v11 = src_arr[y1, x1, c].astype(np.float32)
        val = v00*(1-wx)*(1-wy) + v01*wx*(1-wy) + v10*(1-wx)*wy + v11*wx*wy
        warped[:, :, c] = np.clip(val, 0, 255).astype(np.uint8)

    warped[oob] = 0
    return Image.fromarray(warped, "RGBA")


# ─────────────────────────────────────────────────────────────────────────────
# Body silhouette analysis
# ─────────────────────────────────────────────────────────────────────────────

def _row_spans(mask: np.ndarray, y_min: int, y_max: int, threshold: int = 40):
    spans = []
    for y in range(y_min, y_max + 1):
        px = np.where(mask[y] > threshold)[0]
        if len(px) >= 4:
            spans.append(dict(y=y,
                              left=int(px[0]), right=int(px[-1]),
                              width=int(px[-1] - px[0]),
                              center=int((px[0] + px[-1]) // 2)))
    return spans


def get_body_measurements(mask: np.ndarray) -> Optional[dict]:
    """Derive key body measurements from a binary silhouette mask."""
    h, w = mask.shape
    has_row = np.any(mask > 40, axis=1)
    has_col = np.any(mask > 40, axis=0)
    if not has_row.any() or not has_col.any():
        return None

    y_top = int(np.argmax(has_row))
    y_bot = int(h - np.argmax(has_row[::-1]) - 1)
    person_h = y_bot - y_top
    if person_h < 80:
        return None

    spans = _row_spans(mask, y_top, y_bot)
    if not spans:
        return None

    def closest(y, tol=12):
        cands = [s for s in spans if abs(s["y"] - y) <= tol]
        return min(cands, key=lambda s: abs(s["y"] - y)) if cands else None

    # Shoulder: widest row in 12–38% of body
    sh_band = [s for s in spans
               if y_top + person_h*0.12 <= s["y"] <= y_top + person_h*0.38]
    if not sh_band:
        sh_band = spans[:max(1, len(spans)//4)]
    shoulder = max(sh_band, key=lambda s: s["width"])

    neck_y     = y_top + int(person_h * 0.11)
    armhole_y  = shoulder["y"] + int(person_h * 0.13)
    chest_y    = shoulder["y"] + int(person_h * 0.26)
    hem_y      = y_top + int(person_h * 0.67)

    return dict(
        y_top=y_top, y_bot=y_bot, person_h=person_h,
        shoulder=shoulder,
        neck_y=neck_y, armhole_y=armhole_y,
        chest_y=chest_y, hem_y=hem_y,
        spans=spans, closest=closest,
    )


def body_control_points(m: dict) -> np.ndarray:
    """
    Return 10 body control points (x, y) in the template image.
    Order must match garment_control_points() exactly.
    """
    sh = m["shoulder"]
    closest = m["closest"]

    def pt(y_key):
        s = closest(m[y_key])
        return s if s else sh

    def side_pt(y_key, side, shrink=0.10):
        s = closest(m[y_key])
        if not s:
            s = sh
        inner = int(s["width"] * shrink)
        x = s["left"] + inner if side == "left" else s["right"] - inner
        return (x, s["y"])

    # neck center
    neck_s = closest(m["neck_y"])
    neck = (neck_s["center"] if neck_s else sh["center"], m["neck_y"])

    # shoulder corners (outer edge ± small padding)
    pad = int(sh["width"] * 0.04)
    l_sh = (sh["left"]  + pad, sh["y"])
    r_sh = (sh["right"] - pad, sh["y"])

    # armhole (inner edge of body at armhole level)
    l_arm = side_pt("armhole_y", "left",  0.12)
    r_arm = side_pt("armhole_y", "right", 0.12)

    # mid chest
    l_chest = side_pt("chest_y", "left",  0.08)
    r_chest = side_pt("chest_y", "right", 0.08)

    # hem corners + center
    hem_s = closest(m["hem_y"], tol=20)
    if hem_s:
        l_hem = (hem_s["left"],    m["hem_y"])
        r_hem = (hem_s["right"],   m["hem_y"])
        c_hem = (hem_s["center"],  m["hem_y"])
    else:
        hw = sh["width"] // 2
        l_hem = (sh["center"] - hw, m["hem_y"])
        r_hem = (sh["center"] + hw, m["hem_y"])
        c_hem = (sh["center"],      m["hem_y"])

    return np.array([neck, l_sh, r_sh, l_arm, r_arm,
                     l_chest, r_chest, l_hem, r_hem, c_hem],
                    dtype=np.float64)


def garment_control_points(garment_rgba: Image.Image) -> np.ndarray:
    """
    Return 10 control points (x, y) on the flat-lay garment that correspond
    to the 10 body control points from body_control_points().
    """
    alpha = np.array(garment_rgba)[:, :, 3]
    gh, gw = alpha.shape

    rows = np.any(alpha > 20, axis=1)
    cols = np.any(alpha > 20, axis=0)
    if not rows.any() or not cols.any():
        return _fallback_garment_pts(0, 0, gw, gh)

    r0, r1 = int(np.where(rows)[0][0]),  int(np.where(rows)[0][-1])
    c0, c1 = int(np.where(cols)[0][0]),  int(np.where(cols)[0][-1])
    g_h = r1 - r0
    if g_h < 30:
        return _fallback_garment_pts(c0, r0, c1, r1)

    spans = _row_spans(alpha, r0, r1, threshold=20)
    if not spans:
        return _fallback_garment_pts(c0, r0, c1, r1)

    def closest(y, tol=10):
        cands = [s for s in spans if abs(s["y"] - y) <= tol]
        return min(cands, key=lambda s: abs(s["y"] - y)) if cands else None

    # shoulder: widest in top 8-28%
    sh_band = [s for s in spans
               if r0 + g_h*0.08 <= s["y"] <= r0 + g_h*0.28]
    shoulder = max(sh_band, key=lambda s: s["width"]) if sh_band else spans[0]

    # neck: narrowest / topmost center
    neck_band = [s for s in spans if s["y"] <= r0 + g_h*0.12]
    if neck_band:
        neck_s = min(neck_band, key=lambda s: s["width"])
        neck = (neck_s["center"], neck_s["y"])
    else:
        neck = (shoulder["center"], r0)

    pad = int(shoulder["width"] * 0.04)
    l_sh = (shoulder["left"]  + pad, shoulder["y"])
    r_sh = (shoulder["right"] - pad, shoulder["y"])

    # armhole level ~20% below shoulder
    arm_y = shoulder["y"] + int(g_h * 0.18)
    arm_s = closest(arm_y)
    if arm_s:
        inner = int(arm_s["width"] * 0.10)
        l_arm = (arm_s["left"]  + inner, arm_y)
        r_arm = (arm_s["right"] - inner, arm_y)
    else:
        l_arm = (shoulder["left"],  arm_y)
        r_arm = (shoulder["right"], arm_y)

    # mid body ~45%
    mid_y = r0 + int(g_h * 0.45)
    mid_s = closest(mid_y)
    if mid_s:
        inner = int(mid_s["width"] * 0.07)
        l_chest = (mid_s["left"]  + inner, mid_y)
        r_chest = (mid_s["right"] - inner, mid_y)
    else:
        l_chest = (shoulder["left"],  mid_y)
        r_chest = (shoulder["right"], mid_y)

    # hem
    hem_s = closest(r1, tol=15)
    if hem_s:
        l_hem = (hem_s["left"],   r1)
        r_hem = (hem_s["right"],  r1)
        c_hem = (hem_s["center"], r1)
    else:
        l_hem = (c0, r1)
        r_hem = (c1, r1)
        c_hem = ((c0+c1)//2, r1)

    return np.array([neck, l_sh, r_sh, l_arm, r_arm,
                     l_chest, r_chest, l_hem, r_hem, c_hem],
                    dtype=np.float64)


def _fallback_garment_pts(c0, r0, c1, r1) -> np.ndarray:
    cx = (c0 + c1) // 2
    h = r1 - r0
    return np.array([
        (cx, r0),
        (c0, r0 + int(h*0.10)), (c1, r0 + int(h*0.10)),
        (c0, r0 + int(h*0.22)), (c1, r0 + int(h*0.22)),
        (c0, r0 + int(h*0.50)), (c1, r0 + int(h*0.50)),
        (c0, r1), (c1, r1), (cx, r1),
    ], dtype=np.float64)


# ─────────────────────────────────────────────────────────────────────────────
# Arm restoration
# ─────────────────────────────────────────────────────────────────────────────

def restore_arms(composite: Image.Image,
                 original: Image.Image,
                 person_mask: np.ndarray,
                 m: dict) -> Image.Image:
    """
    Blend original arm/face pixels back on top of the composite so the
    person looks like they are actually wearing the garment.
    """
    sh = m["shoulder"]
    torso_half = int(sh["width"] * 0.42)
    cx = sh["center"]
    hem_y = m["hem_y"]
    th, tw = person_mask.shape

    # Arm region: lateral body pixels outside the torso column
    arm = np.zeros((th, tw), dtype=np.float32)
    l = max(0, cx - torso_half)
    r = min(tw, cx + torso_half)
    person_f = person_mask.astype(np.float32) / 255.0

    arm[:, :l] = person_f[:, :l]
    arm[:, r:] = person_f[:, r:]
    arm[hem_y:, :] = 0   # keep lower body as-is

    # Soft transition
    arm_smooth = np.array(
        Image.fromarray((arm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=14))
    ).astype(np.float32) / 255.0

    comp = np.array(composite.convert("RGBA")).astype(np.float32)
    orig = np.array(original.convert("RGBA")).astype(np.float32)
    a4 = np.stack([arm_smooth]*4, axis=-1)

    result = orig * a4 + comp * (1.0 - a4)
    return Image.fromarray(np.clip(result, 0, 255).astype(np.uint8), "RGBA")


# ─────────────────────────────────────────────────────────────────────────────
# CPU fallback pipeline (TPS-based virtual try-on)
# ─────────────────────────────────────────────────────────────────────────────

def run_cpu_fallback(
    clothing_image: Image.Image,
    template_image: Image.Image,
    output_path: Path,
    progress_callback: Optional[Callable] = None,
) -> dict:
    start = time.time()
    stages = {}

    # ── Stage 1: Background removal ──────────────────────────────────────────
    if progress_callback:
        progress_callback("background_removal", 0.0)
    t0 = time.time()
    garment_rgba = remove_bg(clothing_image)
    person_rgba  = remove_bg(template_image)   # body silhouette for landmark detection
    stages["background_removal_ms"] = int((time.time() - t0) * 1000)
    if progress_callback:
        progress_callback("background_removal", 1.0)

    # ── Stage 2: TPS cloth warp ───────────────────────────────────────────────
    if progress_callback:
        progress_callback("generating", 0.0)
    t0 = time.time()

    tw, th = template_image.convert("RGB").size
    person_mask = np.array(person_rgba)[:, :, 3]
    measurements = get_body_measurements(person_mask)

    try:
        if measurements is None:
            raise ValueError("Body not detected in model photo")

        # 10 matching control points
        body_pts    = body_control_points(measurements)
        garment_pts = garment_control_points(garment_rgba)

        logger.info("Applying TPS warp (%d control points)", len(body_pts))
        warped = warp_image_tps(
            src_img  = garment_rgba,
            src_pts  = garment_pts,   # points in garment space
            dst_pts  = body_pts,      # where those points land on body
            out_size = (tw, th),
        )

        # Feather garment edges
        w_arr = np.array(warped).astype(np.float32)
        alpha_f = Image.fromarray(w_arr[:, :, 3].astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=3))
        w_arr[:, :, 3] = np.array(alpha_f).astype(np.float32)
        warped_f = Image.fromarray(w_arr.astype(np.uint8), "RGBA")

        # Paste warped garment onto template
        base = template_image.convert("RGBA").copy()
        base.paste(warped_f, (0, 0), warped_f)

        # Restore arms/face on top
        result = restore_arms(base, template_image, person_mask, measurements)

    except Exception as e:
        logger.warning("TPS warp failed (%s) — using scaled fallback", e)
        # Simple scaled paste fallback
        gc = crop_to_content(garment_rgba)
        gw_f = int(tw * 0.55)
        gh_f = int(gc.height * gw_f / max(gc.width, 1))
        gc = gc.resize((gw_f, gh_f), Image.LANCZOS)
        base = template_image.convert("RGBA").copy()
        base.paste(gc, ((tw - gw_f)//2, int(th * 0.18)), gc)
        result = base

    stages["tryon_generation_ms"] = int((time.time() - t0) * 1000)
    if progress_callback:
        progress_callback("generating", 1.0)

    # ── Stage 3: Save ─────────────────────────────────────────────────────────
    if progress_callback:
        progress_callback("enhancing", 0.0)
    stages["face_restoration_ms"] = 0
    stages["super_resolution_ms"] = 0
    if progress_callback:
        progress_callback("enhancing", 1.0)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.convert("RGB").save(str(output_path), "JPEG", quality=92)

    total_ms = int((time.time() - start) * 1000)
    logger.info("CPU try-on done in %dms (bg_rm=%d, warp=%d)",
                total_ms,
                stages["background_removal_ms"],
                stages["tryon_generation_ms"])
    return {
        "status": "completed",
        "result_path": f"/results/{output_path.name}",
        "processing_time_ms": total_ms,
        "stages": stages,
        "mode": "cpu_tps_tryon",
    }


# ─────────────────────────────────────────────────────────────────────────────
# GPU pipeline (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

def create_torso_mask(template: Image.Image) -> Image.Image:
    w, h = template.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([int(w*0.15), int(h*0.18), int(w*0.85), int(h*0.78)], fill=200)
    return mask.filter(ImageFilter.GaussianBlur(radius=20))


def run_gpu_pipeline(
    clothing_image: Image.Image,
    template_image: Image.Image,
    output_path: Path,
    preferences: dict,
    style_prompt: Optional[str],
    progress_callback: Optional[Callable] = None,
) -> dict:
    import torch
    import cv2

    start = time.time()
    stages = {}

    if progress_callback:
        progress_callback("background_removal", 0.0)
    t0 = time.time()
    from rembg import remove
    garment_rgba = remove(clothing_image.convert("RGBA"), session=get_rembg_session())
    stages["background_removal_ms"] = int((time.time() - t0) * 1000)
    if progress_callback:
        progress_callback("background_removal", 1.0)

    if progress_callback:
        progress_callback("generating", 0.0)
    t0 = time.time()
    pipe = get_flux_pipeline()
    template_rgb = template_image.convert("RGB")
    w, h = template_rgb.size

    garment_rgb = Image.new("RGB", garment_rgba.size, (255, 255, 255))
    garment_rgb.paste(garment_rgba, mask=garment_rgba.split()[3])
    garment_resized = garment_rgb.resize((w, h), Image.LANCZOS)

    concat = Image.new("RGB", (w * 3, h))
    concat.paste(garment_resized, (0, 0))
    concat.paste(template_rgb,   (w, 0))
    concat.paste(template_rgb,   (w*2, 0))

    mask = Image.new("L", (w*3, h), 0)
    mask.paste(create_torso_mask(template_rgb), (w*2, 0))

    prompt = "A person wearing the garment, high quality fashion photography"
    if style_prompt:
        prompt += f", {style_prompt}"

    result_concat = pipe(
        image=concat, mask_image=mask,
        width=w*3, height=h,
        num_inference_steps=30, guidance_scale=30.0,
        prompt=prompt,
    ).images[0]
    result = result_concat.crop((w*2, 0, w*3, h))
    stages["tryon_generation_ms"] = int((time.time() - t0) * 1000)
    if progress_callback:
        progress_callback("generating", 1.0)

    if progress_callback:
        progress_callback("face_restore", 0.0)
    t0 = time.time()
    gfpgan = get_gfpgan()
    if gfpgan:
        result_np = np.array(result)
        result_bgr = cv2.cvtColor(result_np, cv2.COLOR_RGB2BGR)
        _, _, restored = gfpgan.enhance(result_bgr, has_aligned=False, only_center_face=False, paste_back=True)
        result = Image.fromarray(cv2.cvtColor(restored, cv2.COLOR_BGR2RGB))
    stages["face_restoration_ms"] = int((time.time() - t0) * 1000)
    if progress_callback:
        progress_callback("face_restore", 1.0)

    if progress_callback:
        progress_callback("enhancing", 0.0)
    t0 = time.time()
    upscaler = get_realesrgan()
    if upscaler:
        result_np = np.array(result)
        result_bgr = cv2.cvtColor(result_np, cv2.COLOR_RGB2BGR)
        upscaled, _ = upscaler.enhance(result_bgr, outscale=2)
        result = Image.fromarray(cv2.cvtColor(upscaled, cv2.COLOR_BGR2RGB))
    stages["super_resolution_ms"] = int((time.time() - t0) * 1000)
    if progress_callback:
        progress_callback("enhancing", 1.0)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(str(output_path), "JPEG", quality=95)

    total_ms = int((time.time() - start) * 1000)
    return {
        "status": "completed",
        "result_path": f"/results/{output_path.name}",
        "processing_time_ms": total_ms,
        "stages": stages,
        "mode": "gpu",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Main entry point
# ─────────────────────────────────────────────────────────────────────────────

def run_pipeline(
    job_id: str,
    clothing_path: str,
    template_path: str,
    output_filename: str,
    preferences: dict,
    style_prompt: Optional[str] = None,
    progress_callback: Optional[Callable] = None,
) -> dict:
    output_path = NEXT_PUBLIC_DIR / "results" / output_filename
    output_path.parent.mkdir(parents=True, exist_ok=True)

    clothing_image = load_image_from_url_or_path(clothing_path)
    template_image = load_image_from_url_or_path(template_path)

    if GPU_MODE:
        return run_gpu_pipeline(clothing_image, template_image, output_path,
                                preferences, style_prompt, progress_callback)
    return run_cpu_fallback(clothing_image, template_image, output_path, progress_callback)
