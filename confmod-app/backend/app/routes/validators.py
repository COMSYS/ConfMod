import caseconverter
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from libconfmod import ConfmodModel

from ..ext.responses import FormValidationResponse
from ..model.config import PickledConfmodConfig
from ..model.confmod import PickledConfmodModel
from ..db import get_db
from ..schema.shared import FormValidationError

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/validate",
    default_response_class=FormValidationResponse,
    responses={
        200: {
            "model": FormValidationError
        },
        204: {
            "description": "If the validation is successful, returns an empty response without further information."
        } 
    }
)

@router.get("/config/uniqueName", response_class=FormValidationResponse)
def validate_name_does_not_exist(name: str, db: Session = Depends(get_db)):
    slugified = caseconverter.kebabcase(name)

    count = db.query(PickledConfmodConfig.slug).where(PickledConfmodConfig.slug == slugified).first()
    if count is not None:
        return f"The name {name} is already taken"

    return None

@router.get(
    "/model/{slug}/observationAvailable",
    summary="Verify that the chosen model does not yet have an observation with the given name",
    responses={ 404: { "description": "Model with the given slug does not exist." } }
)
def check_observation_available(slug: str, label: str, db: Session = Depends(get_db)):
    """
    A validator that checks wheter the passed name is already defined in the given model.

    To compare the names both strings will be stripped from whitespace and all characters are converted to lower case.
    """
    model = db.query(PickledConfmodModel).where(PickledConfmodModel.slug == slug).first()
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    model = ConfmodModel.from_raw(model.json_model)
    
    observations = [observation.replace(" ", "").lower() for observation in model.head.obs.keys()]
    
    if label.replace(" ", "").lower() in observations:
        return FormValidationResponse(f"Observation with label \"{label}\" already exists")