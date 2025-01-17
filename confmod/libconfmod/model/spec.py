from __future__ import annotations

from typing import Any
from collections.abc import Collection
from dataclasses import dataclass
from .header import ConfmodHeader
from .raw import RawPayloadValue, RawConfmodModel


@dataclass(frozen=True)
class PayloadItem:
    label: str
    featureValues: tuple[Any, ...]

    @classmethod
    def from_raw(cls, raw: RawPayloadValue) -> PayloadItem:
        label = raw[0]
        if type(label) is not str:
            raise TypeError("First entry of payload value must be of type str")
        featureValues = raw[1:]
        return cls(label, featureValues)

    def to_raw(self) -> RawPayloadValue:
        return (self.label, *self.featureValues)
    

@dataclass(frozen=True)
class ConfmodModel:
    head: ConfmodHeader
    payload: list[PayloadItem]

    @classmethod
    def from_raw(cls, raw: RawConfmodModel) -> ConfmodModel:
        head = ConfmodHeader.from_raw(raw["head"])
        payload = [PayloadItem.from_raw(raw_pld_itm) for raw_pld_itm in raw["payload"]]
        return cls(head, payload)

    def to_raw(self) -> RawConfmodModel:
        return RawConfmodModel(
            head=self.head.to_raw(),
            payload=[pld_itm.to_raw() for pld_itm in self.payload]
        )