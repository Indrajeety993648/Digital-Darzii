# Digital Darzi — MVP

## What This Is
Local MVP of an AI virtual try-on platform. User uploads a clothing image,
selects model preferences, and gets a realistic on-model photo.
No authentication. No payments. No cloud services. Everything runs locally.

## Architecture
- Next.js 15 app (frontend + API) on port 3000
- Python FastAPI AI service on port 8000
- SQLite database (via Prisma) at prisma/dev.db
- Images stored in public/uploads/ and public/results/

## Tech Stack
- Next.js 15, App Router, TypeScript strict, Tailwind CSS v4, shadcn/ui New York style
- GSAP 3.12+ with @gsap/react, ScrollTrigger, SplitText, Draggable
- Framer Motion for micro-interactions
- Prisma ORM with SQLite
- Python 3.11, FastAPI, CatVTON-FLUX, rembg, GFPGAN, Real-ESRGAN

## Key Commands
- pnpm dev → Start Next.js (port 3000)
- cd ai-service && uvicorn main:app --reload --port 8000 → Start AI
- pnpm db:push → Push Prisma schema to SQLite
- pnpm db:seed → Seed model templates into DB
- pnpm build → Production build

## Database (SQLite — prisma/schema.prisma)
GenerationRequest:
  id, status, clothingImageUrl, resultImageUrl, modelGender, modelBodyType,
  modelSkinTone, modelPose, backgroundStyle, stylePrompt, processingStage,
  processingTimeMs, errorMessage, createdAt, completedAt

ModelTemplate:
  id, gender, bodyType, skinTone, pose, category, imageUrl, isActive

## Design System
Colors:
  --bg-dark: #0A0A0A (landing page)
  --bg-light: #FAFAFA (app pages)
  --accent: #4F46E5 (indigo-600)
  --accent-hover: #4338CA (indigo-700)

Fonts:
  Display: "Clash Display" (headings)
  Body: "Inter" (text)
  Mono: "JetBrains Mono"

## API Endpoints
POST /api/upload → Upload clothing image, returns { imageUrl }
POST /api/generate → Create generation job, returns { id }
GET  /api/status/[id] → Get generation status + result URL
GET  /api/generations → List all generations for gallery

## AI Service Endpoints (FastAPI on :8000)
POST /generate → Run full pipeline
GET  /health → health check
GET  /status/{job_id} → current processing stage
