"""
Model loading and caching for Digital Darzi AI service.
Uses GPU_MODE environment variable to toggle between full pipeline and CPU fallback.
"""

import os
import logging

logger = logging.getLogger(__name__)

GPU_MODE = os.environ.get("GPU_MODE", "false").lower() == "true"

_cache: dict = {}


def get_rembg_session():
    """rembg background removal - works on CPU too."""
    if "rembg" not in _cache:
        logger.info("Loading rembg model (U2-Net)...")
        from rembg import new_session
        _cache["rembg"] = new_session("u2net")
        logger.info("rembg ready.")
    return _cache["rembg"]


def get_flux_pipeline():
    """CatVTON-FLUX try-on pipeline - GPU only."""
    if not GPU_MODE:
        return None
    if "flux" not in _cache:
        logger.info("Loading CatVTON-FLUX pipeline (this takes a few minutes)...")
        import torch
        from diffusers import FluxFillPipeline
        pipe = FluxFillPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-Fill-dev",
            torch_dtype=torch.bfloat16,
        )
        pipe.load_lora_weights("Zheng-Chong/CatVTON-Flux-Alpha")
        pipe.enable_model_cpu_offload()
        _cache["flux"] = pipe
        logger.info("CatVTON-FLUX ready.")
    return _cache["flux"]


def get_gfpgan():
    """GFPGAN face restorer - GPU only."""
    if not GPU_MODE:
        return None
    if "gfpgan" not in _cache:
        logger.info("Loading GFPGAN...")
        from gfpgan import GFPGANer
        _cache["gfpgan"] = GFPGANer(
            model_path="weights/GFPGANv1.4.pth",
            upscale=1,
            arch="clean",
            channel_multiplier=2,
        )
        logger.info("GFPGAN ready.")
    return _cache["gfpgan"]


def get_realesrgan():
    """Real-ESRGAN upscaler - GPU only."""
    if not GPU_MODE:
        return None
    if "realesrgan" not in _cache:
        logger.info("Loading Real-ESRGAN...")
        from basicsr.archs.rrdbnet_arch import RRDBNet
        from realesrgan import RealESRGANer
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
        _cache["realesrgan"] = RealESRGANer(
            scale=2,
            model_path="weights/RealESRGAN_x2plus.pth",
            model=model,
            tile=400,
            tile_pad=10,
            pre_pad=0,
            half=True,
        )
        logger.info("Real-ESRGAN ready.")
    return _cache["realesrgan"]


def warmup_models():
    """Pre-load models at startup. Safe to call in both GPU and CPU modes."""
    try:
        get_rembg_session()  # always load this
        if GPU_MODE:
            get_flux_pipeline()
            get_gfpgan()
            get_realesrgan()
    except Exception as e:
        logger.warning(f"Model warmup warning: {e}")
