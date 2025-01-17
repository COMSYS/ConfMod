from fastapi import FastAPI
from app.app import api
import uvicorn
import cfg

default_port = 8888

import mimetypes

app = FastAPI()
app.mount(cfg.get_api_base_url(), api)

# Define a healthcheck for docker for quickly figuring out if the server is running
@app.get("/health/ready", response_model=dict)
def ready_healthcheck():
    return { "ready": True }

def run_server():
    uvicorn.run(app, host=cfg.get_listen_addr(), port=cfg.get_port())

if __name__ == "__main__":
    cfg.set_configured_log_level()
    mimetypes.init()
    run_server()