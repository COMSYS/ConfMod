from __future__ import annotations

from enum import Enum
from typing import Literal, TypeAlias
from datetime import datetime, timedelta
from decimal import Decimal
from ..util.enum import StringEnum

PayloadSpecLabel: TypeAlias = str
FeatureSpecLabel: TypeAlias = str

ObservationTypeValue: TypeAlias = Literal['E', 'M']

class ObservationTypes(StringEnum):
    E: ObservationTypeValue = "E"
    M: ObservationTypeValue = "M"

class ObservationType(Enum):
    Event = "E"
    Measurement = "M"

class FeatureDataTypes(Enum):
    String = 'string'
    Int = 'int'
    Float = 'float'
    Decimal = 'decimal'
    Fraction = 'fraction'
    Boolean = 'boolean'
    Timestamp = 'timestamp'
    Date = 'date'
    Duration = 'duration'
    File = 'file'

FeatureDataType: TypeAlias = str | int | float | bool | datetime | timedelta

Numeric: TypeAlias = int | float | Decimal


class PayloadType(Enum):
    EVENT = "E"
    MEASUREMENT = "M"

    @classmethod
    def values(cls):
       return list(map(lambda v: v.value, cls))