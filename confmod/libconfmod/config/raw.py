from __future__ import annotations

from typing import  NotRequired, Mapping, Any, TypedDict
from pydantic import TypeAdapter
from yaml import safe_dump as yaml_safe_dump

class RawFeatureMetadataConfig(TypedDict):
    data_type: NotRequired[bool]
    value_range: NotRequired[bool]


class RawFeatureConfig(TypedDict):
    metadata: NotRequired[list[str]]
    includePayload: NotRequired[bool]
    includeDataType: NotRequired[bool]
    transform: NotRequired[list["RawTransformFunc"]]

class RawObservationConfig(TypedDict):
    features: dict[str, RawFeatureConfig]
    transform: NotRequired[list[str | dict]]
    """deprecated"""

    includePayload: NotRequired[bool]
    """deprectaed"""
    includeMetadata: NotRequired[bool]
    """deprecated"""

    metadata: NotRequired[list[str]]

class RawScopeConfig(TypedDict):
    outFile: NotRequired[str]
    observations: dict[str, RawObservationConfig]
    metadata: NotRequired[list[str]]
    includePayload: NotRequired[bool]

class RawConfmodConfig(TypedDict):
    scopes: dict[str, RawScopeConfig]

class RawTransformFunc(TypedDict):
    name: str
    args: dict[str, str | int | float]

RawConfigAdapter = TypeAdapter(RawConfmodConfig)
def cast_dict_to_raw_config(data: Mapping[str, Any]) -> RawConfmodConfig:
    return RawConfigAdapter.validate_python(data)
    

def from_yaml(yaml_str: str) -> RawConfmodConfig:
    from yaml import safe_load
    raw_dict = safe_load(yaml_str)
    return cast_dict_to_raw_config(raw_dict)

def to_yaml_str(config: RawConfmodConfig) -> str:
    return yaml_safe_dump(config)
