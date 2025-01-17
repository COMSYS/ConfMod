from typing import Literal, Optional
from pydantic import BaseModel
from libconfmod.model.spec import RawConfmodModel
from libconfmod.config.config import RawConfmodConfig, RawObservationConfig

from .confmod import ConfmodModelUpdate

class BaseError(BaseModel):
    error_type: str
    message: str

class FormValidationError(BaseError):
    error_type: Literal["formValidation"] = "formValidation"

class CreateModelAndConfig(BaseModel):
    name: str
    model: Optional[RawConfmodModel] = None
    config: Optional[RawConfmodConfig] = None

class CreateModelAndConfigResult(BaseModel):
    name: str
    slug: str

class AddObservaionOutput(BaseModel):
    name: str
    observation_label: str
    model_update: RawConfmodModel
    observation_config: RawObservationConfig