from typing import TextIO

from .config import ConfmodConfig
from . import raw


def config_from_yaml(stream: TextIO) -> ConfmodConfig:
    raw_cfg = raw.from_yaml(stream.read())
    return ConfmodConfig.from_raw(raw_cfg)
