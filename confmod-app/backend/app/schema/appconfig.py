from typing import Annotated, Optional
from annotated_types import Ge
from pydantic import BaseModel, HttpUrl
from pathlib import Path

class ClientAppConfig(BaseModel):
    apiUrl: HttpUrl = "http://localhost:8888/api"
    availableCategories: list[str] = []

class AppConfig(BaseModel):
    https: bool = False
    host: str = "0.0.0.0"
    port: Annotated[int, Ge(0)] = 8888
    logLevel: str = "INFO"
    frontendDir: Optional[Path] = None
    """The directory where the frontends files are served from.
        If not given, the frontent will not be served."""
    assetsDir: Optional[Path] = None
    mediaDir: Optional[Path] = None
    clientConfig: ClientAppConfig
