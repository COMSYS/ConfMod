from __future__ import annotations
import typing
from .model.spec import ConfmodModel
from .model.raw import RawConfmodModel, assertRawBridgeModel
import json


def model_from_json_stream(stream: typing.TextIO) -> ConfmodModel:
    if not stream.readable():
        # TODO: Provide a custom exception
        raise Exception("File must be readable")

    raw_dict: dict = json.load(stream) 
    rawBrideModel = assertRawBridgeModel(raw_dict)
    return ConfmodModel.from_raw(rawBrideModel)
    


