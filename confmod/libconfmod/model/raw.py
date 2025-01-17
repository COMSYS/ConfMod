from __future__ import annotations

import io
from typing import TypedDict, NotRequired, Any, TypeAlias, Literal
from decimal import Decimal
from pydantic import TypeAdapter
from .shared_types import ObservationTypeValue, FeatureDataTypes
from .protocols import RawRangedValues


class RawFeatureMetadata(TypedDict):
    label: str
    description: NotRequired[str]
    value: Any

class RawDetailedDataType(TypedDict):
    type: str

class RawEnumDataType(RawDetailedDataType):
    type: Literal["enum"]
    variants: list[str]

class RawFileDataType(RawDetailedDataType):
    type: Literal["file"]
    extension: NotRequired[str]
    mime_type: str


class RawFeatureSpec(TypedDict):
    label: str
    description: NotRequired[str]
    data_type: NotRequired[str]
    metadata: NotRequired[list[RawFeatureMetadata[str]]]
    #value_metadata: NotRequired[list[RawFeatureMetadata[Any]]]


class RawObservationSpec(TypedDict):
    type: ObservationTypeValue
    description: NotRequired[str]
    features: list[RawFeatureSpec]


RawPayloadHeader: TypeAlias = dict[str, RawObservationSpec]
RawMetadataHeader: TypeAlias = dict[str, str]


class RawConfmodHeader(TypedDict):
    observations: RawPayloadHeader
    metadata: RawMetadataHeader

RawPayloadValue: TypeAlias = tuple[str | int | float, ...]
RawPayloadValues: TypeAlias = list[RawPayloadValue]


class RawConfmodModel(TypedDict):
    head: RawConfmodHeader
    payload: RawPayloadValues

_RawConfmodModelValidator = TypeAdapter(RawConfmodModel)

def assertRawBridgeModel(dct: dict) -> RawConfmodModel:
    return _RawConfmodModelValidator.validate_python(dct)