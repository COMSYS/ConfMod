from __future__ import annotations

import copy
from collections.abc import Collection
from dataclasses import dataclass, field, MISSING
from importlib import metadata
from typing import Any, Mapping, Optional
from xml.etree.ElementInclude import include

from .raw import (
    RawConfmodConfig,
    RawFeatureConfig,
    RawFeatureMetadataConfig,
    RawObservationConfig,
    RawScopeConfig,
    RawTransformFunc,
    to_yaml_str
)
from ..model.shared_types import FeatureDataTypes


@dataclass()
class FeatureMetadataConfig:
    includeDataType: bool = field(default=False)
    includeValueRange: bool = field(default=False)

    def include_all(self) -> bool:
        """True iff all of the metadata for this feature should be included."""
        return self.includeDataType and self.includeValueRange

    def exclude_all(self) -> bool:
        """True iff all of the metadata for this feature should be excluded."""
        return not (self.includeDataType or self.includeValueRange)

    @classmethod
    def from_raw(cls, raw: RawFeatureMetadataConfig) -> FeatureMetadataConfig:
        includeDataType = raw.get("data_type", False)
        includeValueRange = raw.get("value_range", False)
        return cls(
            includeDataType=includeDataType,
            includeValueRange=includeValueRange,
        )

    def to_raw(self) -> bool | RawFeatureMetadataConfig:
        if self.include_all():
            return True
        if self.exclude_all():
            return False

        return RawFeatureMetadataConfig(
            data_type=self.includeDataType,
            value_range=self.includeValueRange,
        )


@dataclass
class FeatureConfig:
    name: str
    metadata: set[str] = field(default_factory=set)
    include_data_type: bool = field(default=False)
    include_payload: bool = field(default=False)
    transform: list["TransformFunction"] = field(default_factory=list)

    @classmethod
    def from_raw(cls, name: str, raw: RawFeatureConfig) -> FeatureConfig:
        cfg = cls(
            name=name,
            metadata=set(raw.get("metadata", []))
        )

        if "includePayload" in raw:
            cfg.include_payload = raw["includePayload"]
        if "includeDataType" in raw:
            cfg.include_data_type = raw["includeDataType"]
        if "transform" in raw:
            cfg.transform = [TransformFunction.from_raw(rtf) for rtf in raw["transform"]]

        return cfg

    def to_raw(
        self, ctx_include_payload=False, ctx_include_meta=False
    ) -> RawFeatureConfig:
        feat_cfg = RawFeatureConfig(includeDataType=self.include_data_type)

        #if (ctx_include_meta and not self.metadata.include_all()) or (
        #    not ctx_include_meta and not self.metadata.exclude_all()
        #):
        feat_cfg["metadata"] = sorted(self.metadata)
        # elif not (not ctx_include_meta and self.metadata.exclude_all()):
        #    print("AllExcluded: Including feature metadata")
        #    feat_cfg["metadata"] = self.metadata.to_raw()

        if self.include_payload != ctx_include_payload:
            feat_cfg["includePayload"] = True

        if len(self.transform) > 0:
            # TODO: Transformation definition
            feat_cfg["transform"] = [ t.to_raw() for t in self.transform ]

        return feat_cfg


@dataclass
class ObservationConfig:
    label: str
    """Identifier for the observation specification by its label."""

    features: Mapping[str, FeatureConfig] = field(default_factory=dict)
    """Configuration of features corresponding to that observation."""

    #transform: list[Any] = field(default_factory=list)

    #includeMetadata: bool = field(default=True)
    #"""If any feature metadata should be included. This setting can be overridden on feature level."""

    metadata: set[str] = field(default=set)

    #includePayload: bool = field(default=False)
    #"""If the payload should contain any value of this observation. Can be overridden on the feature level."""

    def payload_included_features(self) -> Optional[list[str]]:
        """Returns a list of feature identifiers that will get included in the payload.
        If the observation is completely omitted `None` will be returned.

        Returns:
            Optional[list[str]]: A list of strings or None
        """
        raise NotImplementedError()

    @classmethod
    def from_raw(cls, label: str, raw: RawObservationConfig) -> ObservationConfig:
        if "features" in raw:
            features={ name: FeatureConfig.from_raw(name, raw_feature) for name, raw_feature in raw["features"].items() }
        else:
            features={}

        #if "includePayload" in raw:
        #    cfg.includePayload = raw["includePayload"]
        #if "includeMetadata" in raw:
        #    cfg.includeMetadata = raw["includeMetadata"]
        #if "transform" in raw:
        #    cfg.transform = raw["transform"].copy()
        metadata = set(raw.get("metadata", []))

        if len(features) == 0 and len(metadata) == 0:
            return None

        cfg = cls(
            label=label,
            features=features,
            metadata=metadata,
        )

        #if "includePayload" in raw:
        #    instance.includePayload = raw["includePayload"]

    def to_raw(self) -> RawObservationConfig | None:
        obs_cfg = RawObservationConfig(
            features={
                f.name: f.to_raw(
                    ctx_include_payload=self.includePayload,
                    ctx_include_meta=self.includeMetadata,
                )
                for f in self.features.values()
            }
        )
        obs_cfg["includePayload"] = self.includePayload
        obs_cfg["includeMetadata"] = self.includeMetadata
        if len(self.transform) > 0:
            obs_cfg["transform"] = self.transform

        return obs_cfg

    def add_feature_config(self, feature_cfg: FeatureConfig):
        feature_label = feature_cfg.name
        self.features[feature_label] = feature_cfg


@dataclass
class ScopeConfig:
    identifier: str
    observations: Mapping[str, ObservationConfig] = field(default_factory=dict)
    metadata: list[str] = field(default_factory=list)
    includePayload: bool = field(default=False)

    @classmethod
    def from_raw(cls, identifier: str, raw: RawScopeConfig) -> ScopeConfig:
        cfg = cls(
            identifier=identifier,
            observations={
                label: ObservationConfig.from_raw(label, raw_obs)
                for label, raw_obs in raw["observations"].items()
            },
        )
        if "metadata" in raw:
            cfg.metadata = raw["metadata"].copy()
        if "includePayload" in raw:
            cfg.includePayload = raw["includePayload"]

        return cfg

    def to_raw(self) -> RawScopeConfig:
        return RawScopeConfig(
            includePayload=self.includePayload,
            # TODO
            observations={
                obs_cfg.label: obs_cfg.to_raw()
                for obs_cfg in self.observations.values() if obs_cfg is not None
            },
            metadata=self.metadata,
        )

    def add_observation_config(self, label: str, obs_cfg: ObservationConfig):
        self.observations[label] = obs_cfg


@dataclass
class ScopeConfigCollection(Collection):
    configs: dict[str, Any]


@dataclass
class ConfmodConfig:
    scopes: dict[str, ScopeConfig]

    @classmethod
    def from_raw(cls, raw: RawConfmodConfig):
        return cls(
            scopes={
                ident: ScopeConfig.from_raw(ident, scope)
                for ident, scope in raw["scopes"].items()
            }
        )

    def to_raw(self) -> RawConfmodConfig:
        return RawConfmodConfig(
            scopes={scope.identifier: scope.to_raw() for scope in self.scopes.values()}
        )
    
    def to_yaml(self) -> str:
        raw_config = self.to_raw()
        return to_yaml_str(raw_config)

    def add_observation_config(self, label: str, obs_cfg: ObservationConfig):
        for scope in self.scopes.values():
            scope.add_observation_config(label=label, obs_cfg=copy.deepcopy(obs_cfg))

@dataclass
class TransformFunction:
    name: str
    args: list[str | int | float]

    @classmethod
    def from_raw(cls, raw: RawTransformFunc):
        return cls(
            name=raw["name"],
            args=raw["args"]
        )

    def to_raw(self) -> RawTransformFunc:
        return RawTransformFunc(
            name=self.name,
            args=self.args,
        )