from fastapi import HTTPException, status
from sqlalchemy import delete
from sqlalchemy.orm import Session
from ..model.config import PickledConfmodConfig

def delete_config(db: Session, slug: str):
    stmt = delete(PickledConfmodConfig).where(PickledConfmodConfig.slug == slug)
    db.execute(stmt)

def get_by_slug(slug: str, db: Session) -> PickledConfmodConfig:
    """
    Find a model in the DB by its unique slug attribute. Throws a HTTP 404 if such a model does not exist
    """
    db_cfg = db.query(PickledConfmodConfig).where(PickledConfmodConfig.slug == slug).first()
    if db_cfg is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Config with slug \"{slug}\" does not exist.")
    return db_cfg