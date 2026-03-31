/**
 * Replicate IDM-VTON client.
 *
 * Runs a real, GPU-hosted virtual try-on (cuuupid/idm-vton). The model takes a
 * person image + garment image (+ category/description) and internally handles
 * segmentation, DensePose, masking and SDXL inpainting — returning a realistic
 * on-model image. No local GPU required.
 *
 * Local upload files are sent as base64 data URIs (Replicate can't reach
 * localhost), and the result is downloaded by the caller so it survives after
 * Replicate's temporary output URL expires.
 */
import { readFile } from "fs/promises";
import path from "path";

const REPLICATE_API = "https://api.replicate.com/v1";
// Pinned official model — Replicate resolves the latest version automatically.
const MODEL = "cuuupid/idm-vton";

export type TryOnCategory = "upper_body" | "lower_body" | "dresses";
export type TryOnStage = "uploading" | "processing" | "generating" | "enhancing";

export class ReplicateError extends Error {
  constructor(message: string, readonly userMessage: string) {
    super(message);
    this.name = "ReplicateError";
  }
}

function token(): string {
  const t = process.env.REPLICATE_API_TOKEN;
  if (!t) {
    throw new ReplicateError(
      "REPLICATE_API_TOKEN is not set",
      "AI service is not configured. Add REPLICATE_API_TOKEN to .env.local and restart."
    );
  }
  return t;
}

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Convert a /public-relative path (or pass through an http URL) to a data URI. */
export async function toDataUri(urlOrPath: string): Promise<string> {
  if (urlOrPath.startsWith("http")) return urlOrPath;
  const rel = urlOrPath.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  const buf = await readFile(abs);
  const mime = MIME[path.extname(abs).toLowerCase()] ?? "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

interface Prediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | string[] | null;
  error: string | null;
  urls: { get: string; cancel: string };
}

async function api<T = Prediction>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body?.detail || body?.title || res.statusText;
    let userMessage = `AI service error (${res.status}). Please try again.`;
    if (res.status === 422) userMessage = `Invalid input for the AI model: ${detail}`;
    else if (res.status === 401) userMessage = "Invalid REPLICATE_API_TOKEN. Check .env.local and restart.";
    else if (res.status === 402) userMessage = "Replicate account has no credit. Add billing at replicate.com/account/billing.";
    else if (res.status === 429) userMessage = "Replicate rate limit hit. Wait a moment and try again.";
    throw new ReplicateError(`Replicate ${res.status}: ${JSON.stringify(body)}`, userMessage);
  }
  return body as T;
}

// Resolve and cache the model's latest version id (community models run via
// POST /v1/predictions with a pinned version).
let cachedVersion: string | null = null;
async function latestVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  const model = await api<{ latest_version: { id: string } }>(`${REPLICATE_API}/models/${MODEL}`, {
    method: "GET",
  });
  cachedVersion = model.latest_version.id;
  return cachedVersion;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface TryOnParams {
  humanImage: string; // /uploads/... path or url
  garmentImage: string;
  category: TryOnCategory;
  description?: string;
  steps?: number;
  seed?: number;
  onStage?: (stage: TryOnStage) => void;
  signal?: AbortSignal;
}

/**
 * Run a try-on prediction end-to-end. Returns the raw image bytes of the result.
 */
export async function runTryOn(params: TryOnParams): Promise<{ buffer: Buffer; contentType: string }> {
  const { onStage, signal } = params;

  onStage?.("uploading");
  const [human_img, garm_img] = await Promise.all([
    toDataUri(params.humanImage),
    toDataUri(params.garmentImage),
  ]);

  onStage?.("processing");
  const version = await latestVersion();
  let prediction = await api(`${REPLICATE_API}/predictions`, {
    method: "POST",
    body: JSON.stringify({
      version,
      input: {
        human_img,
        garm_img,
        garment_des: params.description?.trim() || "garment",
        category: params.category,
        crop: false,
        seed: params.seed ?? 42,
        steps: params.steps ?? 30,
      },
    }),
  });

  // Poll until terminal. ~2s cadence; IDM-VTON typically finishes in 15-30s.
  let announcedGenerating = false;
  while (prediction.status === "starting" || prediction.status === "processing") {
    if (signal?.aborted) throw new ReplicateError("aborted", "Generation timed out. Please try again.");
    if (prediction.status === "processing" && !announcedGenerating) {
      onStage?.("generating");
      announcedGenerating = true;
    }
    await sleep(2000);
    prediction = await api(prediction.urls.get);
  }

  if (prediction.status !== "succeeded" || !prediction.output) {
    const err = prediction.error || `prediction ${prediction.status}`;
    throw new ReplicateError(`Prediction failed: ${err}`, friendlyFailure(err));
  }

  onStage?.("enhancing");
  const outUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  const imgRes = await fetch(outUrl);
  if (!imgRes.ok) throw new ReplicateError(`Download failed: ${imgRes.status}`, "Could not retrieve the result image.");
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  return { buffer, contentType };
}

function friendlyFailure(err: string): string {
  const e = err.toLowerCase();
  if (e.includes("nsfw") || e.includes("safety")) return "The image was flagged by the safety filter. Try a different photo.";
  if (e.includes("face") || e.includes("pose") || e.includes("parsing")) return "Couldn't detect a clear, full-body pose in the model photo. Try a front-facing, well-lit photo.";
  return "Generation failed. Try a clearer garment and a front-facing model photo.";
}
