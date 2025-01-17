from app import api, serve_index
from app.schema.appconfig import AppConfig
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
import logging
import os
import uvicorn
import yaml
import pathlib

logger = logging.getLogger(__name__)

app = FastAPI()
app.mount("/api", api)

def create_dict_from_object(obj):
    result = {}
    for key, value in vars(obj).items():
        if isinstance(value, dict):
            result[key] = create_dict_from_object(value)
        elif isinstance(value, list):
            result[key] = [create_dict_from_object(item) for item in value]
        else:
            result[key] = value
    return result

def load_app_config() -> AppConfig:
    data = {}
    with open("app-config.yaml", "r") as f:
        data = yaml.safe_load(f)

    try:
        return AppConfig(**data)
    except ValidationError as e:
        logger.error("Invalid application config: %s", e)
        exit(1)

def write_client_config(appConfig: AppConfig, filepath: pathlib.Path):
    with open(filepath, "w") as f:
        cfg_dict = dict(appConfig.clientConfig.__dict__)
        print(cfg_dict)
        yaml.safe_dump(cfg_dict, f)
            
if __name__ == "__main__":
    appConfig = load_app_config()
    clientConfig = appConfig.clientConfig
    logger.setLevel(appConfig.logLevel)

    if appConfig.frontendDir is not None:
        app.mount("/client", StaticFiles(directory=appConfig.frontendDir))

        assetsDir = appConfig.assetsDir or pathlib.Path(appConfig.frontendDir).joinpath("assets")
        app.mount("/assets", StaticFiles(directory=str(assetsDir)))
        #frontendAppConfig = pathlib.Path(assetsDir).joinpath("config/app-config.yaml")
        #write_client_config(appConfig, frontendAppConfig)

        mediaDir = appConfig.mediaDir or pathlib.Path(appConfig.frontendDir).joinpath("media")
        app.mount("/media", StaticFiles(directory=str(assetsDir)))

        # If the frontend is served from this server, we need to route all remaining paths to the index page
        # in order for client side routing to work correctly
        index_html = pathlib.Path(appConfig.frontendDir).joinpath("index.html")
        app.add_route("/{path:path}", serve_index(str(index_html)), methods=["GET"])

    uvicorn.run(app, host=appConfig.host, port=appConfig.port)