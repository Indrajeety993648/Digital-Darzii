import subprocess
import time
import requests
import os
import sys

print("Killing old uvicorn processes...")
os.system("pkill -f uvicorn")
time.sleep(1)

print("Starting Digital Darzi AI Service in MOCK_MODE...")
env = os.environ.copy()
env["MOCK_MODE"] = "true"
env["GPU_MODE"] = "false"

# Using python3 -m uvicorn for better portability
server = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"], 
    cwd="ai-service",
    env=env
)

print("Waiting for server to expose healthcheck...")
max_retries = 30
success = False
base_url = "http://localhost:8000"

try:
    for i in range(max_retries):
        try:
            r = requests.get(f"{base_url}/health")
            if r.status_code == 200:
                print("✅ Healthcheck OK!")
                print(f"Server info: {r.json()}")
                success = True
                break
        except requests.ConnectionError:
            time.sleep(1)

    if success:
        print("\nTesting /generate endpoint (Mocked)...")
        payload = {
            "job_id": "test-job-123",
            "clothing_image_path": "/mock/greencloth.jpeg",
            "template_image_path": "/mock/female-model.jpeg",
            "preferences": {"garment_category": "upper_body"},
            "output_filename": "test-output.jpg"
        }
        r = requests.post(f"{base_url}/generate", json=payload)
        if r.status_code == 200:
            print("✅ Generation request successful!")
            print(f"Mock result: {r.json()}")
        else:
            print(f"❌ Generation request failed: {r.status_code}")
            print(r.text)
            success = False

finally:
    print("\nShutting down server...")
    server.terminate()
    server.wait()

if success:
    print("\nAll tests passed successfully!")
else:
    print("\nTests failed!")
    sys.exit(1)

