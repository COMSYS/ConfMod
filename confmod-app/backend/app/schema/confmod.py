from typing import Any, Literal, LiteralString
from pydantic import BaseModel, TypeAdapter
from libconfmod.model.raw import RawConfmodModel, RawObservationSpec

_ConfmodModel = TypeAdapter(RawConfmodModel)

class ConfmodModelBase(BaseModel):
    pass

class ConfmodModelCreate(ConfmodModelBase):
    name: str
    model: RawConfmodModel

class ConfmodModelUpdate(ConfmodModelBase):
    name: str
    model: RawConfmodModel

class ConfmodModelGet(ConfmodModelBase):
    model: RawConfmodModel

class ConfmodModelObservationCreate(BaseModel):
    label: str
    observation: RawObservationSpec

class ConfmodModelFeatureMetadataCreate(BaseModel):
    label: str
    type: Literal["descriptive"] | Literal["value"]
    description: str | None = None
    value: Any

class ConfmodModelAddMetadata(BaseModel):
    key: str
    value: str

class ConfmodModelUpdateCategories(BaseModel):
    categories: list[str]