from typing import Annotated
from fastapi import FastAPI, UploadFile, Request, status, Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from libconfmod import ConfmodModel, ConfmodConfig, generate_empty_model, generate_default_config
from libconfmod.config.io import config_from_yaml
from os import PathLike

from sqlalchemy import exists
from sqlalchemy.orm import Session
import caseconverter
import json
import yaml
import yaml.parser

from .routes import model, config, functions, validators
from .exception_handlers import handle_json_decode_error, handle_yaml_decode_error
from .db import SqlBase, engine, get_db
from .schema.shared import CreateModelAndConfig, CreateModelAndConfigResult
from .model.confmod import PickledConfmodModel
from .model.config import PickledConfmodConfig
from .services import confmod_config_service, confmod_model_service

import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

SqlBase.metadata.create_all(bind=engine)

api = FastAPI(
    title="Confmod Backend",
    summary="Privacy and interopaerability for sensitive modeling.",
    openapi_tags=[
        {
            "name": "Model"
        },
        {
            "name": "Config"
        }
    ],
)

allowed_origins = [
    "http://127.0.0.1:4200",
    "https://127.0.0.1:4200",
    "http://localhost:4200",
    "https://locahost:4200",
    "http://127.0.0.1:8888",
    "https://127.0.0.1:8888",
    "http://localhost:8888",
    "https://locahost:8888",
    "http://127.0.0.1:8080",
    "https://127.0.0.1:8080",
    "http://localhost:8080",
    "https://locahost:8080",
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(model.router)
api.include_router(config.router)
api.include_router(functions.router)
api.include_router(validators.router, tags=["Validators"])


@api.post("/create", tags=["Model", "Config"], status_code=status.HTTP_200_OK, response_model=CreateModelAndConfigResult)
def create_model_and_config(body: CreateModelAndConfig, db: Session = Depends(get_db)):
    name = body.name
    slug = caseconverter.kebabcase(name)

    already_exists: bool = db.query(exists().where(PickledConfmodConfig.slug == slug or PickledConfmodModel.slug == slug)).scalar()
    if already_exists:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Model or Config with that name already exist") 

    if body.model is not None:
        model = ConfmodModel.from_raw(body.model)
    else:
        model = generate_empty_model()

    if body.config is not None:
        raw_config = body.config
    else:
        raw_config = generate_default_config(model=model).to_raw

    db_model = PickledConfmodModel(
        name=name,
        slug=slug,
        json_model=model.to_raw()
    )
    db_config = PickledConfmodConfig(
        name=name,
        slug=slug,
        config=raw_config
    )

    db.add_all([db_model, db_config])
    db.flush()
    db.refresh(db_config)
    db.commit()

    return CreateModelAndConfigResult(
        name=db_config.name,
        slug=db_config.slug,
    )



@api.delete("/delete/{slug}", tags=["Model", "Config"], status_code=status.HTTP_204_NO_CONTENT)
def delete_model_and_config(slug: str, db: Session = Depends(get_db)):
    try:
        confmod_config_service.delete_config(db, slug)
    finally:
        db.flush()

    try:
        confmod_model_service.delete_model(db, slug)
    finally:
        db.flush()
    db.commit()


api.add_exception_handler(json.decoder.JSONDecodeError, handle_json_decode_error)
api.add_exception_handler(yaml.parser.ParserError, handle_yaml_decode_error)

def serve_index(path: str | PathLike[str]):
    def index(*args):
        return FileResponse(path)

    return index
