from __future__ import annotations

from typing import TypeAlias
from .shared_types import PayloadSpecLabel, FeatureDataType

PayloadItem: TypeAlias = tuple[PayloadSpecLabel, FeatureDataType, ...]
