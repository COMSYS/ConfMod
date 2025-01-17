from __future__ import annotations

import enum
import typing
from typing import Iterator, Optional


class StringEnumMeta(type):
    def __new__(cls, name, bases, dct):
        clss = super().__new__(cls, name, bases, dct)
        clss.value_map = {
            k: v
            for k, v in dct.items()
            if not str.startswith(k, "_") and type(v) is str
        }
        clss.values = list(clss.value_map.values())
        return clss

    def __getitem__(self, key) -> str:
        if key in self.value_map:
            return self.value_map[key]
        elif key in self.values:
            return key

    def __len__(self) -> int:
        return len(self.value_map)

    def __iter__(self) -> Iterator[str]:
        return iter(self.values)

    def derive_enum(cls, name: Optional[str] = None) -> typing.Type[enum.Enum]:
        return enum.Enum(cls.__name__[:-1] if name is None else name, cls.value_map)

class StringEnum(metaclass=StringEnumMeta):
    pass
