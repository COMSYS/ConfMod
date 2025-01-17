import math
import pandas as pd

from confmod.model.df_util import df_to_raw_observation_spec, df_to_raw_payload_values
from confmod.model.shared_types import ObservationType
from confmod.model.spec import BrideHeader, BrideModel
from confmod.model.raw import RawMetadataHeader, RawConfmodModel, RawConfmodHeader

ppm_df = pd.read_csv("./db/csv/ppm_measurement_3.csv", index_col=[0])


#ppm_df[["ap", "ae", "fz"]] = ppm_df[["ap", "ae", "fz"]].dtypes.truncate(after=2)
ppm_df["ae"] = ppm_df["ae"].apply(lambda x: (math.trunc(x * 100) / 100))
ppm_df["ap"] = ppm_df["ap"].apply(lambda x: (math.trunc(x * 100) / 100))
ppm_df["fz"] = ppm_df["fz"].apply(lambda x: (math.trunc(x * 10000) / 10000))

ppm_spec = df_to_raw_observation_spec("BASE_POINT", ObservationType.Measurement, ppm_df)
meta = RawMetadataHeader({
    "company": "WZL",
    "nc_type": "Siemens_840d_sl"
})
payload = df_to_raw_payload_values("BASE_POINT", ppm_df)

model = BrideModel.from_raw(RawConfmodModel(
    head=RawConfmodHeader(
        observations=ppm_spec,
        metadata=meta
    ),
    payload=payload
))


import json

with open('./db/data/refined/measurement_data_3_21_scopexy.json', 'w') as fd:
    raw = model.to_raw()
    json.dump(raw, fd, indent=2)

