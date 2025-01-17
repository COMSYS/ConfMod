from __future__ import annotations

import json
from model import model


def decode(json_str: str, **kwargs) -> model.Model:
    """Deserializes a json string, representing a `Model` into a python object

    Args:
        json_str (str): The json string

    Returns:
        Model: An instance of the `Model` class
    """
    decoder = json.JSONDecoder(**kwargs, object_hook=None, object_pairs_hook=None)
    decoded_dict = decoder.decode(json_str)
    return _decode_model(decoded_dict)


def _decode_model(decode_res: dict) -> model.Model:
    if "head" not in decode_res:
        raise KeyError('Expected to find key "head" in JSON string')
    head = _decode_model_head(decode_res["head"])

    if "payload" not in decode_res:
        raise KeyError('Expected key "payload"')

    pyld_list = decode_res["payload"]
    if not isinstance(pyld_list, list):
        raise ValueError("Expected payload to be a list")

    payload = []
    for item in pyld_list:
        payload_item = _decode_model_payload_item(item)
        if not head.defines_payload_item(payload_item):
            raise Exception("Payload references undefined item")

        payload.append(payload_item)

    obj = model.Model(head, payload)
    return obj


def _decode_model_head(head_dict: dict) -> model.ModelHead:
    if not ("defs" in head_dict and "meta" in head_dict):
        raise KeyError('Expected a JSON string with keys "defs" and "meta"')
    defs = _decode_model_head_defs(head_dict["defs"])
    meta = head_dict["meta"]
    return model.ModelHead(defs, meta)


def _decode_model_head_defs(defs_dict: dict) -> dict[str, model.PayloadDefinition]:
    res = dict()
    for label, pld_def in defs_dict.items():
        if not isinstance(pld_def, dict):
            raise ValueError("Expected Payload Definition to be a dict")
        res[label] = _decode_payload_def(pld_def, label)
    return res


def _decode_payload_def(payload_def: dict, label: str) -> model.PayloadDefinition:
    if not ("type" in payload_def and "features" in payload_def):
        raise KeyError('Expected keys "type" and "features"')
    type = payload_def["type"]
    if not (type in model.PayloadType.values()):
        raise ValueError(f"Expected type to of {model.PayloadType.values()}. Found {type}")
    features = payload_def["features"]

    return model.PayloadDefinition(label, model.PayloadType(type), features)


def _decode_model_payload_item(payload_entries: list) -> model.PayloadItem:
    try:
        label = payload_entries.pop(0)
    except IndexError:
        raise ValueError("Expected payload entry to contain a label at first position")
    return model.PayloadItem(label, payload_entries)
