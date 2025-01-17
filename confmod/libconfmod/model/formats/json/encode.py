#from __future__ import annotations

import json

from model import model

class ModelJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, model.Model):
            return {
                "head": self.default(obj.head),
                "payload": [self.default(pld_itm) for pld_itm in obj.payload],
            }
        elif isinstance(obj, model.ModelHead):
            print(obj.defs)
            return {
                "defs": {label: self.default(pyld_def) for label, pyld_def in obj.defs.items()},
                "meta": obj.meta,
            }
        elif isinstance(obj, model.PayloadDefinition):
            return {
                "type": obj.payload_type.value,
                "features": obj.features
            }
        elif isinstance(obj, model.PayloadItem):
            res = [obj.label]
            res.extend(obj.values)
            return res
        else:
            super().default(obj)

def encode(obj: "model.Model", **kwargs):
    if not isinstance(obj, model.Model):
        raise TypeError("Object to encode to json needs to be of type \"Model\"")
    return json.dumps(obj, **kwargs, cls=ModelJsonEncoder)