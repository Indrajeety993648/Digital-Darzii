# 🧵 Digital Darzi — AI Virtual Try-On

Transform a flat-lay garment photo into a realistic on-model image. Upload a garment + a model photo, and a real diffusion-based try-on model fits the garment onto the person — preserving texture and draping.

## How It Works

```
Next.js 15 (frontend + API + queue)   → localhost:3000
Prisma + SQLite (jobs/history)        → prisma/dev.db
Replicate (hosted GPU: IDM-VTON)      → real virtual try-on, no local GPU
Images                                → public/uploads/ + public/results/
```

The browser uploads images to `/api/upload`, then `/api/generate` runs the try-on
through **Replicate's `cuuupid/idm-vton`** model (SDXL inpainting + DensePose +
human parsing, all server-side on Replicate's GPUs). The result is downloaded and
saved to `public/results/`. The result page polls `/api/status/[id]` and shows live
progress.

> Why hosted inference? High-fidelity try-on needs a 16 GB+ GPU. Replicate runs it
> on demand (~15–30s, a few cents per generation) so the app runs smoothly on any
> laptop with no local model downloads.

## Quick Start

```bash
pnpm install
cp .env.example .env.local      # then add your REPLICATE_API_TOKEN
pnpm db:push                    # create the SQLite database
pnpm dev                        # http://localhost:3000
```

### Get a Replicate token
1. Create an account at https://replicate.com and add billing at
   https://replicate.com/account/billing (try-on calls cost a few cents each).
2. Create a token at https://replicate.com/account/api-tokens.
3. Put it in `.env.local`:
   ```
   REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Tech Stack

- **Next.js 15** — App Router, TypeScript strict, API routes
- **Tailwind CSS v4**, **Framer Motion**, **GSAP** — UI & animation
- **Prisma + SQLite** — zero-config local database for jobs/history
- **Replicate / IDM-VTON** — hosted, GPU-backed virtual try-on

## Features

- Real virtual try-on (no mocked output) via IDM-VTON
- Garment category (upper body / lower body / dresses) + optional description
- Live progress timeline driven by the real prediction stages
- Graceful failure handling with actionable messages + retry
- Per-session daily generation limit (default 5) to bound API cost —
  configurable via `GENERATION_DAILY_LIMIT`

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── generate/           # Upload garment + model, pick category
│   │   ├── result/[id]/        # Live progress + result view
│   │   ├── gallery/            # Past generations
│   │   └── api/
│   │       ├── upload/         # Save uploaded images to public/uploads
│   │       ├── generate/       # Start a try-on (calls Replicate)
│   │       ├── status/[id]/    # Poll job status
│   │       └── generations/    # List history
│   ├── components/             # landing / generate / result / gallery / ui
│   ├── hooks/                  # useGenerationStatus, use-toast
│   └── lib/
│       ├── db.ts               # Prisma client
│       ├── replicate.ts        # IDM-VTON client (upload, poll, download)
│       └── limits.ts           # Per-session daily limit
├── prisma/schema.prisma        # SQLite schema (GenerationRequest)
└── public/                     # uploads/, results/, showcase/
```

## Tips for Good Results

- **Garment:** flat-lay or hanger shot on a clean background.
- **Model:** a clear, front-facing, well-lit full-body photo.
- Pick the correct **category** — it controls where the garment is fitted.

## Notes / Limitations

- No authentication — anyone with the URL can use the app.
- Cost & quality come from Replicate; results depend on input photo quality.
- One image at a time; daily limit is per browser session (cookie-based).
