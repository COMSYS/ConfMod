from fastapi import HTTPException, status
from sqlalchemy import delete
from sqlalchemy.orm import Session
from ..model.confmod import PickledConfmodModel
from ..schema.confmod import ConfmodModelObservationCreate
from libconfmod import ConfmodModel

def delete_model(db: Session, slug: str):
    stmt = delete(PickledConfmodModel).where(PickledConfmodModel.slug == slug)
    db.execute(stmt)

def get_by_slug(slug: str, db: Session) -> PickledConfmodModel:
    """
    Find a model in the DB by its unique slug attribute. Throws a HTTP 404 if such a model does not exist
    """
    db_model = db.query(PickledConfmodModel).where(PickledConfmodModel.slug == slug).first()
    if db_model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Model with slug \"{slug}\" does not exist.")
    return db_model

def get_model_by_slug(slug: str, db: Session) -> ConfmodModel:
    db_model = get_by_slug(slug, db)
    return ConfmodModel.from_raw(db_model.json_model)