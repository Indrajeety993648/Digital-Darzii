# Digital Darzi AI Service

FastAPI service that runs the virtual try-on AI pipeline.

## Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# For GPU support (requires NVIDIA GPU + CUDA):
pip install -r requirements-gpu.txt
```

## Running

```bash
# CPU mode (default — works on any machine, demo quality)
uvicorn main:app --reload --port 8000

# GPU mode (full quality, ~40s per image)
GPU_MODE=true uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health` — Check service status and GPU availability
- `POST /generate` — Run the try-on pipeline
- `GET /status/{job_id}` — Get current processing stage

## Pipeline Stages

**CPU mode (default):**
1. Background removal (rembg, ~3s)
2. Simple composite onto template
3. Demo watermark added

**GPU mode:**
1. Background removal (rembg, ~2s)
2. CatVTON-FLUX try-on generation (~30s)
3. GFPGAN face restoration (~3s)
4. Real-ESRGAN 2x upscaling (~5s)
