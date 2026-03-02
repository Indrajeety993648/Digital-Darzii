# 🧵 Digital Darzi — AI Virtual Try-On MVP

Transform flat-lay garment photos into stunning on-model product images. Built for Indian fashion sellers.

## What It Does

1. Upload a flat-lay clothing image
2. Pick model preferences (gender, body type, skin tone, pose, background)
3. Click Generate → watch real-time processing stages
4. Download the studio-quality on-model result

## Architecture

```
Next.js 15 (frontend + API)     → localhost:3000
Python FastAPI (AI pipeline)    → localhost:8000
SQLite database                 → prisma/dev.db
Images                          → public/uploads/ + public/results/
```

## Quick Start

### Terminal 1 — Next.js App
```bash
pnpm install
pnpm db:push      # Create SQLite database
pnpm db:seed      # Seed model templates
pnpm dev          # Start on localhost:3000
```

### Terminal 2 — AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### GPU Mode (Full Quality)
```bash
# Install GPU dependencies first
pip install -r ai-service/requirements-gpu.txt

# Then run with GPU mode enabled
GPU_MODE=true uvicorn main:app --reload --port 8000
```

## Tech Stack

- **Next.js 15** — App Router, TypeScript strict
- **Tailwind CSS v4** — Utility-first styling
- **GSAP 3.12** — SplitText, ScrollTrigger, Draggable animations
- **Framer Motion** — Micro-interactions
- **Prisma + SQLite** — Zero-config local database
- **Python FastAPI** — AI processing backend
- **rembg** — Background removal (CPU-friendly)
- **CatVTON-FLUX** — Virtual try-on generation (GPU)
- **GFPGAN** — Face restoration (GPU)
- **Real-ESRGAN** — 2× upscaling (GPU)

## AI Pipeline

### CPU Mode (default, no GPU needed)
- Background removal via rembg (~3s)
- Simple composite onto model template
- Demo watermark added
- Total: ~5-10s

### GPU Mode (`GPU_MODE=true`)
- rembg background removal (~2s)
- CatVTON-FLUX virtual try-on generation (~30s)
- GFPGAN face restoration (~3s)
- Real-ESRGAN 2× upscaling (~5s)
- Total: ~40s per image

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── generate/           # Upload + preferences
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
│   ├── pipeline.py             # AI pipeline (CPU + GPU)
│   ├── models.py               # Model loading + caching
│   └── requirements.txt        # Base (CPU-safe) deps
└── docker-compose.yml          # Optional local services
```

## System Requirements

- **Node.js** ≥ 20
- **Python** ≥ 3.10
- **GPU** (optional) — NVIDIA GPU with ≥8GB VRAM for full quality
  - CPU mode works on any machine, produces demo-quality results

## First Run Notes

- First GPU mode run downloads ~10GB of model weights from HuggingFace
- Model weights are cached in `~/.cache/huggingface/`
- CPU mode uses only rembg (~200MB download)

## Known Limitations (MVP)

- No authentication — anyone with the URL can use the app
- No payments — all features are free in MVP
- No bulk processing — one image at a time
- CPU mode produces demo-quality results with watermark
- GPU required for production-quality output
# Digital-Darzii
