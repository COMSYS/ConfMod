# Utils for converting pandas data frames to the model

from __future__ import annotations

import pandas as pd
from .shared_types import ObservationType, FeatureDataTypes
from .raw import (
    RawPayloadHeader,
    RawObservationSpec,
    RawFeatureMetadata,
    RawPayloadValues,
)


def df_to_raw_observation_spec(name: str, type: ObservationType, df: pd.DataFrame):
    features = dict(
        [
            (col_name, _series_to_raw_feature_spec(col_ser))
            for col_name, col_ser in df.items()
        ]
    )
    return RawPayloadHeader(
        {name: RawObservationSpec(type=type.value, features=features)}
    )


def df_to_raw_payload_values(name: str, df: pd.DataFrame) -> RawPayloadValues:
    return [(name, *features) for features in df.itertuples(index=False)]


def _series_to_raw_feature_spec(series: pd.Series) -> RawFeatureMetadata:
    import pandas.api.types as pd_types

    type: FeatureDataTypes
    supports_interval = False
    if pd_types.is_integer_dtype(series.dtype):
        type = FeatureDataTypes.Int
        supports_interval = True
    elif pd_types.is_float_dtype(series.dtype):
        type = FeatureDataTypes.Float
        supports_interval = True
    elif pd_types.is_string_dtype(series.dtype):
        type = FeatureDataTypes.String
    elif pd_types.is_bool_dtype(series.dtype):
        type = FeatureDataTypes.Boolean
    elif pd_types.is_datetime64_any_dtype(series.dtype):
        type = FeatureDataTypes.Timestamp
        supports_interval = True
    elif pd_types.is_timedelta64_dtype(series.dtype):
        type = FeatureDataTypes.Duration
        supports_interval = True

    raw_feature_metadata = RawFeatureMetadata(type=type.value)
    if supports_interval:
        raw_feature_metadata["value_range"] = (series.min(), series.max())

    return raw_feature_metadata
