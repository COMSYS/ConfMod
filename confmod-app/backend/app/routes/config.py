from typing import List, Annotated, Optional
from fastapi import APIRouter, UploadFile, Depends, status, HTTPException, Query
import caseconverter
from libconfmod.config.io import config_from_yaml
from libconfmod.config.config import ConfmodConfig
from libconfmod.config.raw import RawConfmodConfig
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
import logging
import yaml

from ..error import YamlDecodeError
from ..db import get_db 
from ..model.config import PickledConfmodConfig
from ..schema.config import ConfigCreate, ConfigGetAll, ConfigUpdate, ConfigGetOne
from ..ext.responses import FormValidationResponse

logger = logging.getLogger(__name__)

logging.basicConfig(level=logging.DEBUG)

router = APIRouter(
    prefix="/config",
    tags=["Config"]
)

@router.get("/")
def get_configs(db: Session = Depends(get_db)) -> List[ConfigGetAll]:
    query_stmt = select(PickledConfmodConfig.name, PickledConfmodConfig.slug).order_by(PickledConfmodConfig.id)
    rows = db.execute(query_stmt).all()

    return [ConfigGetAll(name=row.name, slug=row.slug) for row in rows]
    

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_config(body: ConfigCreate, db: Session = Depends(get_db)):
    slug = caseconverter.kebabcase(body.name)
    #config = ConfmodConfig.from_raw(body.config)
    db_config = PickledConfmodConfig(
        name=body.name,
        slug=slug,
        config=body.config
    )

    db.add(db_config)
    db.commit()

@router.get("/{slug}", response_model=ConfigGetOne)
def get_config(slug: str, db: Session = Depends(get_db)) -> ConfigGetOne:
    result = db.query(PickledConfmodConfig).where(PickledConfmodConfig.slug == slug).first()
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return ConfigGetOne(
        name=result.name,
        config=result.config
    )


@router.put("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def update_config(slug: str, body: ConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(PickledConfmodConfig).where(PickledConfmodConfig.slug == slug).first()
    if config is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    config.config = body.config
    db.add(config)
    db.commit()
    db.refresh(config)

@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_config(slug: str, db: Session = Depends(get_db)):
    stmt = delete(PickledConfmodConfig).where(PickledConfmodConfig.slug == slug)
    db.execute(stmt)
    db.commit()


@router.post("/verify", responses={ 400: { "model": YamlDecodeError }})
def verify_config(
    file: UploadFile
) -> RawConfmodConfig:
    logging.info(f"Received config file \"{file.filename}\"")

    #parsed_config = config_from_yaml(file.file)

    file_contents = file.file.read()
    config_dict = yaml.safe_load(file_contents)

    return config_dict

@router.get("/{slug}/export")
def export_config(slug: str, scopes: Annotated[list[str] | None, Query()] = None, db: Session = Depends(get_db)):
    db_config = db.query(PickledConfmodConfig).where(PickledConfmodConfig.slug == slug).first()
    if db_config is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    config = ConfmodConfig.from_raw(db_config.config)
    # if scopes is not None:
    #     config.scopes = { k: v for k, v in config.scopes.items() if k in scopes }

    yaml_str = yaml.safe_dump(db_config.config)
    return yaml_str
