from .spec import ConfmodModel

from .raw import RawConfmodModel, RawConfmodHeader, RawMetadataHeader, RawPayloadHeader, RawPayloadValues


class ConfmodModelGenerator:
    pass


def generate_empty_model() -> ConfmodModel:

    raw = RawConfmodModel(

        head=RawConfmodHeader(

            observations=RawPayloadHeader({}),

            metadata=RawMetadataHeader({})
        ),

        payload=RawPayloadValues([])
    )


    return ConfmodModel.from_raw(raw)