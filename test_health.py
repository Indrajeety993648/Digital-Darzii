import subprocess
import time
import requests
import os

print("Killing old uvicorn...")
os.system("pkill -f uvicorn")
time.sleep(2)

print("Starting server...")
env = os.environ.copy()
env["GPU_MODE"] = "true"
server = subprocess.Popen(
    ["uvicorn", "main:app", "--port", "8000"], 
    cwd="ai-service",
    env=env
)

print("Waiting for server to expose healthcheck...")
max_retries = 150  # 5 minutes
success = False
for i in range(max_retries):
    try:
        r = requests.get("http://localhost:8000/health")
        if r.status_code == 200:
            print("Server is up!")
            print(r.json())
            success = True
            break
    except requests.ConnectionError:
        time.sleep(2)

server.terminate()
server.wait()

if not success:
    print("Test failed!")
    exit(1)
