"""
Digital Darzi AI Service — FastAPI
Runs on port 8000 by default.
Set GPU_MODE=true in environment for full pipeline.
Default: CPU fallback mode (works without GPU for development).
"""

import os
import time
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import GPU_MODE, MOCK_MODE, warmup_models

if not MOCK_MODE:
    from pipeline import run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# In-memory job status store
job_status: dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting Digital Darzi AI Service (GPU_MODE={GPU_MODE})")
    try:
        warmup_models()
        logger.info("Models ready.")
    except Exception as e:
        logger.warning(f"Model warmup skipped: {e}")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Digital Darzi AI Service",
    description="Virtual try-on AI pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    job_id: str
    clothing_image_path: str
    template_image_path: str
    preferences: dict
    style_prompt: Optional[str] = None
    output_filename: str


class GenerateResponse(BaseModel):
    status: str
    result_path: str
    processing_time_ms: int
    stages: dict
    mode: str


@app.get("/health")
async def health():
    gpu_available = False
    try:
        import torch
        gpu_available = torch.cuda.is_available()
    except ImportError:
        pass
    return {
        "status": "ok",
        "gpu_available": gpu_available,
        "gpu_mode": GPU_MODE,
        "mock_mode": MOCK_MODE,
        "mode": "mock" if MOCK_MODE else ("gpu" if GPU_MODE else "cpu_fallback"),
    }


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_status[job_id]


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    job_id = request.job_id
    job_status[job_id] = {"stage": "starting", "progress": 0.0}

    logger.info(f"Starting job {job_id} (mode={'mock' if MOCK_MODE else ('gpu' if GPU_MODE else 'cpu_fallback')})")

    if MOCK_MODE:
        time.sleep(1)  # Simulate short work
        result = {
            "status": "completed",
            "result_path": "/mock/final-output-female.jpeg",
            "processing_time_ms": 1000,
            "stages": {"mock": 1000},
            "mode": "mock"
        }
        job_status[job_id] = {"stage": "done", "progress": 1.0}
        return result

    def progress_callback(stage: str, progress: float):
        job_status[job_id] = {"stage": stage, "progress": progress}
        logger.info(f"Job {job_id}: {stage} {progress*100:.0f}%")

    try:
        result = run_pipeline(
            job_id=job_id,
            clothing_path=request.clothing_image_path,
            template_path=request.template_image_path,
            output_filename=request.output_filename,
            preferences=request.preferences,
            style_prompt=request.style_prompt,
            progress_callback=progress_callback,
        )
        job_status[job_id] = {"stage": "done", "progress": 1.0}
        return result
    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
        job_status[job_id] = {"stage": "failed", "progress": 0.0, "error": str(e)}
        raise HTTPException(status_code=500, detail=str(e))
