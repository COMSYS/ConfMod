from app import api
from fastapi import FastAPI
import logging
import uvicorn


logger = logging.getLogger(__name__)

app = FastAPI()
app.mount("/api", api)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)