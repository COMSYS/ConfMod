from typing import Literal
from pydantic import BaseModel

class BaseError(BaseModel):
    error: str
    message: str

class JsonDecodeError(BaseError):
    error: Literal["JSONDecodeError"] = "JSONDecodeError"
    message: str

class YamlDecodeError(BaseError):
    error: Literal["YAMLDecodeError"] = "YAMLDecodeError"
    message: str