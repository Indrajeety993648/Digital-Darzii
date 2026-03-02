# Digital Darzi AI Service — CPU mode (no GPU required)
# For GPU mode, use requirements-gpu.txt and add --gpus all to docker run

FROM python:3.11-slim

WORKDIR /app

# System dependencies for PIL, rembg
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV GPU_MODE=false

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
