from confmod.config.raw import (
    RawConfmodConfig,
    RawScopeConfig,
    RawObservationConfig,
    RawFeatureConfig,
)

ppm_config = RawConfmodConfig(
    scopes={
        "full"
        "reduced": RawScopeConfig(
            metadata=["company", "nc_type"],
            observations={
                "BASE_POINT": RawObservationConfig(
                    features={
                        "ap": RawFeatureConfig(
                            includeMeta=False,
                            transformations=[{"name": "truncate_decimal", "args": [2]}],
                        ),
                        "ae": RawFeatureConfig(
                            includeMeta=False,
                            transformations=[{"name": "truncate_decimal", "args": [2]}],
                        ),
                        "fz": RawFeatureConfig(
                            includeMeta=False,
                            transformations=[{"name": "truncate_decimal", "args": [4]}],
                        ),
                    }
                )
            },
        )
    }
)

import yaml

with open("./config.ppm_wzl.yaml", "w") as fd:
    yaml.dump(ppm_config, fd)
