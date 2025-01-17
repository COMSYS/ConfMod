from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from .error import JsonDecodeError, YamlDecodeError


import json
def handle_json_decode_error(req: Request, err: json.decoder.JSONDecodeError):
    json_decode_error = JsonDecodeError(message=str(err))
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=jsonable_encoder(json_decode_error)
    )


import yaml
def handle_yaml_decode_error(req: Request, err: yaml.parser.ParserError):
    yaml_decode_error = YamlDecodeError(message=str(err))
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=jsonable_encoder(yaml_decode_error)
    )
