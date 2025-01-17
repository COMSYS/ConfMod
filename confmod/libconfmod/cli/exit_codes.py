from __future__ import annotations
from enum import Enum, auto

class ExitCode(Enum):
    SUCCESS = 0
    GENERIC_FAILURE = 1
    NOT_ATTACHED_TO_TTY = 2
    IO_ERROR = auto()
    VALIDATION_ERROR = auto()