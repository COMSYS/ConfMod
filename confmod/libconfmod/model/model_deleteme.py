# Thils file can be deleted 

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import model.formats



@dataclass
class PayloadDefinition:
    label: str
    payload_type: PayloadType
    features: list[str]


@dataclass
class PayloadItem:
    label: str
    values: list


@dataclass
class ModelHead:
    defs: dict[str, PayloadDefinition]
    meta: dict[str, str]

    def defines_payload_item(self, pyld_item: PayloadItem) -> bool:
        return pyld_item.label in self.defs
    
    def payload_labels(self):
        return list(self.defs.keys())


@dataclass
class Model:
    head: ModelHead
    payload: list[PayloadItem]

    def payload_labels(self):
        return self.head.payload_labels()

    # def to_json(self, **kwargs) -> str:
    #     """Serialize the model into a json string

    #     Returns:
    #         str: A json string
    #     """
    #     #print("Self type:", type(self), isinstance(self, Model))
    #     return formats.json.encode(self, **kwargs)

    # @classmethod
    # def from_json(cls, json_str, **kwargs):
    #     return formats.json.decode(json_str, **kwargs)
