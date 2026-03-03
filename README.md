# 🧵 Digital Darzi — AI Virtual Try-On MVP

Transform flat-lay garment photos into stunning on-model product images using IDM-VTON. Built for Indian fashion sellers.

## What It Does

1. Upload a flat-lay clothing image
2. Upload a model photo (or use a template)
3. Select garment category (upper body, lower body, dresses)
4. Click Generate → watch real-time processing stages
5. Download the studio-quality on-model result

## Architecture

```
Next.js 15 (frontend + API)     → localhost:3000
Python FastAPI (IDM-VTON AI)    → localhost:8000
SQLite database                 → prisma/dev.db
Images                          → public/uploads/ + public/results/
IDM-VTON reference              → IDM-VTON/ (symlinked into ai-service)
```

## Quick Start

### Terminal 1 — Next.js App
```bash
pnpm install
pnpm db:push      # Create SQLite database
pnpm db:seed      # Seed model templates
pnpm dev          # Start on localhost:3000
```

### Terminal 2 — AI Service (GPU Required)
```bash
cd ai-service
pip install -r requirements.txt
pip install -r requirements-gpu.txt

# Download checkpoints (~250MB DensePose + parsing models)
python download_weights.py

# Start with GPU mode
GPU_MODE=true uvicorn main:app --reload --port 8000
```

### CPU Mode (Development Only)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Produces demo-quality composites only (no diffusion)
```

## Tech Stack

- **Next.js 15** — App Router, TypeScript strict
- **Tailwind CSS v4** — Utility-first styling
- **GSAP 3.12** — SplitText, ScrollTrigger, Draggable animations
- **Framer Motion** — Micro-interactions
- **Prisma + SQLite** — Zero-config local database
- **Python FastAPI** — AI processing backend
- **IDM-VTON** — SDXL-based virtual try-on diffusion model
- **DensePose** — Body surface estimation (Detectron2)
- **OpenPose** — Body keypoint detection
- **SCHP** — Human parsing (ATR + LIP, ONNX)
- **rembg** — Background removal

## AI Pipeline (IDM-VTON)

### GPU Mode (required for quality results)
1. **Human Parsing** — SCHP model segments body parts (~1s)
2. **OpenPose** — Keypoint detection for shoulders/arms/wrists (~1s)
3. **DensePose** — Body surface map via Detectron2 (~2s)
4. **Mask Generation** — Inpainting mask from parsing + keypoints
5. **IDM-VTON Diffusion** — SDXL inpainting with:
   - Garment encoder UNet (IP-adapter conditioning)
   - CLIP vision encoder for garment features
   - DensePose-guided body surface awareness
   - 30 denoising steps at 768×1024 (~30-40s)
6. **Auto-crop paste-back** — Returns full-resolution result
7. **Total: ~40-60s per image**

### CPU Mode (development fallback)
- rembg background removal + simple composite
- Demo-quality only, not suitable for production
- Total: ~5-10s

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── generate/           # Upload + preferences + category
│   │   ├── result/[id]/        # Processing + result view
│   │   ├── gallery/            # All past generations
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── landing/            # Hero, HowItWorks, Pricing, FAQ...
│   │   ├── generate/           # UploadZone, ModelSelector...
│   │   ├── result/             # ProcessingTimeline, BeforeAfterSlider
│   │   ├── gallery/            # GalleryGrid
│   │   ├── shared/             # Navbar, MagneticButton, ScrollProgress
│   │   └── ui/                 # shadcn/ui base components
│   ├── hooks/                  # useGenerationStatus, use-toast
│   └── lib/                    # db.ts, utils.ts, animations.ts
├── prisma/
│   ├── schema.prisma           # SQLite schema
│   └── seed.ts                 # Seed model templates
├── public/
│   ├── uploads/                # User-uploaded garment images
│   ├── results/                # AI-generated result images
│   ├── templates/              # Model template images
│   └── showcase/               # Landing page demo images
├── ai-service/                 # Python FastAPI AI backend
│   ├── main.py                 # FastAPI server
│   ├── pipeline.py             # IDM-VTON pipeline orchestration
│   ├── models.py               # Model loading + caching
│   ├── download_weights.py     # Checkpoint downloader
│   ├── utils_mask.py           # Mask generation from parsing+keypoints
│   ├── apply_net.py            # DensePose inference wrapper
│   ├── preprocess/ → IDM-VTON  # Human parsing + OpenPose (symlink)
│   ├── src_idmvton/ → IDM-VTON # TryonPipeline + hacked UNets (symlink)
│   ├── configs/ → IDM-VTON     # DensePose configs (symlink)
│   ├── densepose/ → IDM-VTON   # DensePose module (symlink)
│   ├── detectron2/ → IDM-VTON  # Detectron2 library (symlink)
│   ├── ip_adapter/ → IDM-VTON  # IP-adapter attention (symlink)
│   └── ckpt/ → IDM-VTON        # Checkpoints (symlink)
├── IDM-VTON/                   # Reference IDM-VTON codebase
└── docker-compose.yml          # GPU Docker config
```

## System Requirements

- **Node.js** ≥ 20
- **Python** ≥ 3.10
- **GPU** — NVIDIA GPU with ≥16GB VRAM (required for IDM-VTON)
  - CPU mode works for development only (demo-quality results)

## First Run Notes

- Run `python download_weights.py` first to get DensePose + parsing checkpoints
- First GPU mode run downloads ~10GB of IDM-VTON weights from HuggingFace
- Model weights are cached in `~/.cache/huggingface/`
- CPU mode uses only rembg (~200MB download)

## Known Limitations (MVP)

- No authentication — anyone with the URL can use the app
- No payments — all features are free in MVP
- No bulk processing — one image at a time
- GPU required for production-quality output
- Garment category must be manually selected (upper body / lower body / dresses)
