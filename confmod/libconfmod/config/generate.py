from ..model import ConfmodModel
from .config import ConfmodConfig
from .raw import RawConfmodConfig, RawScopeConfig, RawObservationConfig, RawFeatureConfig
from ..model.header import ObservationSpec

DEFAULT_SCOPES = ["Internal", "Direct Partners", "Supply Chain", "External"]

class ConfmodConfigGenerator:

    def __init__(self, model: ConfmodModel):
        self.model = model.head
    
    def generate(self, scopes: list[str]) -> ConfmodConfig:
        return ConfmodConfig.from_raw(self.generate_raw(scopes))

    def generate_raw(self, scopes: list[str]) -> RawConfmodConfig:
        raw = RawConfmodConfig(scopes=dict([scope, self.generate_scope(scope)] for scope in scopes))
        return raw
    
    def generate_scope(self, scope: str) -> RawScopeConfig:
        raw_scope = RawScopeConfig(
            includePayload=False,
            metadata=[],
            observations=dict([label, self.generate_observation_config(label)] for label in self.model.obs.labels())
        )

        return raw_scope

    def generate_observation_config(self, label: str) -> RawObservationConfig:
        observation: ObservationSpec = self.model.obs[label]
        raw_observation = RawObservationConfig(
            includeMetadata=False,
            includePayload=False,
            transform=[],
            features=dict([feat_label, self.generate_feature_config(label, feat_label)] for feat_label in observation.specs.labels())
        )

        return raw_observation

    def generate_feature_config(self, observation_label: str, feature_label: str) -> RawFeatureConfig:
        raw_feature_cfg = RawFeatureConfig(
            includeDataType=False,
            includePayload=False,
            metadata=[],
            transform=[],
        )

        return raw_feature_cfg


def generate_default_config(model: ConfmodModel) -> ConfmodConfig:
    generator = ConfmodConfigGenerator(model=model)
    return generator.generate(scopes=DEFAULT_SCOPES)