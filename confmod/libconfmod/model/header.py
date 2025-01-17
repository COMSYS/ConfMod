from __future__ import annotations


from abc import ABC, abstractmethod

from dataclasses import dataclass, field
import decimal
import fractions
import datetime

from typing import TYPE_CHECKING, TypeAlias, Optional, Any, Literal

from collections import OrderedDict

from collections.abc import Mapping, Collection, Iterator

from ..model.shared_types import (
    ObservationType,
    FeatureDataTypes,
    FeatureDataType,
    PayloadSpecLabel,
    FeatureSpecLabel,
)

from .raw import (
    RawConfmodHeader,
    RawObservationSpec,
    RawPayloadHeader,
    RawMetadataHeader,
    RawFeatureSpec,
    RawFeatureMetadata,
)

from ..util.iter import take_first

from .shared_types import Numeric

import logging


logger = logging.getLogger(__name__)


@dataclass
class AbstractFeatureMetadata(ABC):
    label: str
    description: Optional[str]
    value: Any


@dataclass
class FeatureValueMetadata(AbstractFeatureMetadata):
    value: Any


@dataclass
class FeatureDescriptiveMetadata(AbstractFeatureMetadata):
    value: str | int | float


@dataclass
class AbstractFeatureSpec(ABC):
    label: str
    description: Optional[str] = field(default=None)

    @property
    @abstractmethod
    def data_type(self) -> FeatureDataTypes | str | None:
        pass

    descriptive_meta: list[FeatureDescriptiveMetadata] = field(default_factory=list)

    @staticmethod
    def from_raw(raw: RawFeatureSpec):

        label = raw.get("label")
        description = raw.get("description")
        data_type = raw.get("data_type", None)
        descriptive_meta = [
            FeatureDescriptiveMetadata(
                label=meta["label"],
                description=meta.get("description", None),
                value=meta["value"],
            )
            for meta in raw.get("metadata", [])
        ]

        logger.debug(f"Data type: {data_type}")

        cls = TypedFeatureSpec[Any]

        def map_value_meta_to_type[T](constructor: type[T] | None) -> list[FeatureValueMetadata[T]]:

            result = []
            for meta_item in raw.get("value_metadata", []):
                label = meta_item.get("label")
                description = meta_item.get("description", None)
                value = meta_item.get("value")
                try:

                    instance_value: T = constructor(value) if constructor else value
                    result.append(
                        FeatureValueMetadata[T](
                            label=label,
                            description=description,
                            value=instance_value,
                        )
                    )

                except Exception as e:

                    logger.warn(
                        f'feature with label "{label}" is of type {type(value)}, expected {constructor.__name__}'
                    )

                    logger.warn(f"{e}")

            return result

        if data_type is None:

            # Typeless FeatureSpec

            value_meta = None

            return TypelessFeatureSpec(
                label=label, description=description, descriptive_meta=descriptive_meta
            )

        elif data_type == FeatureDataTypes.File.value:
            cls = FileFeatureSpec

        elif data_type == FeatureDataTypes.String.value:
            value_meta = map_value_meta_to_type(str)
            cls = StringFeatureSpec

        elif data_type == FeatureDataTypes.Int.value:
            value_meta = map_value_meta_to_type(int)
            cls = IntFeatureSpec

        elif data_type == FeatureDataTypes.Float.value:
            value_meta = map_value_meta_to_type(float)
            cls = FloatFeatureSpec

        elif data_type == FeatureDataTypes.Decimal.value:
            value_meta = map_value_meta_to_type(decimal.Decimal)
            cls = DecimalFeatureSpec

        elif data_type == FeatureDataTypes.Timestamp.value:
            value_meta = map_value_meta_to_type(datetime.datetime)
            cls = TimestampFeatureSpec

        elif data_type == FeatureDataTypes.Date.value:

            value_meta = map_value_meta_to_type(datetime.date)

            cls = DateFeatureSpec
        else:
            value_meta = map_value_meta_to_type[Any]()

        return cls(
            label=label,
            description=description,
            data_type=data_type,
            descriptive_meta=descriptive_meta,
            # value_meta=value_meta,
        )

    def to_raw(self):
        def meta_to_raw(meta: AbstractFeatureMetadata):
            raw_meta = RawFeatureMetadata(label=meta.label, value=meta.value)
            if meta.description is not None:
                raw_meta["description"] = meta.description
            return raw_meta

        raw_metadata = [meta_to_raw(meta) for meta in self.descriptive_meta]
        result = RawFeatureSpec(label=self.label, metadata=raw_metadata)

        if self.data_type is not None:
            if isinstance(self.data_type, FeatureDataTypes):
                result["data_type"] = self.data_type.value
            elif isinstance(self.data_type, str):
                result["data_type"] = self.data_type

        if self.description is not None:
            result["description"] = self.description

        # if self.value_meta is not None:
        #     result["value_metadata"] = [meta_to_raw(meta) for meta in self.value_meta]

        return result


@dataclass
class TypelessFeatureSpec(AbstractFeatureSpec):
    """

    A feature spec that has its type information omitted

    """

    value_meta = None

    data_type: None = field(default=None)


@dataclass
class TypedFeatureSpec[T](AbstractFeatureSpec):

    value_meta: list[T] = field(default_factory=list)
    data_type: str


@dataclass
class IntFeatureSpec(TypedFeatureSpec[int]):

    data_type: FeatureDataTypes = FeatureDataTypes.Int

    value_meta: list[int] = field(default_factory=list)


@dataclass
class FloatFeatureSpec(TypedFeatureSpec[float]):

    data_type: FeatureDataTypes = FeatureDataTypes.Float

    value_meta: list[float] = field(default_factory=list)


@dataclass
class DecimalFeatureSpec(TypedFeatureSpec[decimal.Decimal]):
    data_type: FeatureDataTypes = FeatureDataTypes.Decimal
    value_meta: list[decimal.Decimal] = field(default_factory=list)


@dataclass
class FractionalFeatureSpec(TypedFeatureSpec[fractions.Fraction]):
    data_type: FeatureDataTypes = FeatureDataTypes.Fraction
    value_meta: list[fractions.Fraction] = field(default_factory=list)


@dataclass
class TimestampFeatureSpec(TypedFeatureSpec[datetime.datetime]):
    data_type: FeatureDataTypes = FeatureDataTypes.Timestamp


@dataclass
class DateFeatureSpec(TypedFeatureSpec[datetime.date]):
    data_type: FeatureDataTypes = FeatureDataTypes.Date


@dataclass
class StringFeatureSpec(TypedFeatureSpec[str]):
    data_type: FeatureDataTypes = FeatureDataTypes.String

@dataclass
class FileFeatureSpec(TypelessFeatureSpec):
    data_type: FeatureDataTypes = FeatureDataTypes.File


@dataclass(frozen=True)
class FeatureSpec:

    label: FeatureSpecLabel

    data_type: Optional[FeatureDataTypes] = field(default=None)

    unit: Optional[str] = field(default=None)

    description: Optional[str] = field(default=None)

    value_range: Optional[tuple[int, int]] = field(default=None)

    mean: Optional[Numeric] = field(default=None)

    @classmethod
    def from_raw(cls, raw: RawFeatureSpec) -> FeatureSpec:

        from .raw import RawFeatureMetadata, RawFeatureSpec

        metadata = raw.get("metadata", dict())

        descr = metadata.get("description", None)

        data_type: FeatureDataType = (
            metadata["type"].lower() if "type" in metadata else None
        )

        unit = metadata.get("unit", None)

        value_range = metadata.get("value_range", None)

        mean = metadata.get("mean", None)

        return cls(
            label=raw["label"],
            description=descr,
            data_type=data_type,
            mean=mean,
            unit=unit,
            value_range=value_range,
        )

    def to_raw(self, include_metadata=True) -> RawFeatureSpec:

        feature_spec = RawFeatureSpec(label=self.label)
        if include_metadata:

            from .raw import RawFeatureMetadata

            feature_meta = RawFeatureMetadata()

            if self.description is not None:

                feature_meta["description"] = self.description

            if self.data_type is not None:

                feature_meta["type"] = self.data_type

            if self.unit is not None:

                feature_meta["unit"] = self.unit

            if self.mean is not None:

                feature_meta["mean"] = self.mean

            if self.value_range is not None:

                feature_meta["value_range"] = self.value_range

            feature_spec["metadata"] = feature_meta

        return feature_spec


@dataclass(frozen=True)
class FeatureSpecContainer(Collection):

    specs: OrderedDict[str, AbstractFeatureSpec] = field(default_factory=OrderedDict)

    def __contains__(self, item: object) -> bool:
        if type(item) is str:
            return item in self.specs

        elif isinstance(item, AbstractFeatureSpec):

            return item.label in self.specs

        return False

    def __len__(self) -> int:
        return len(self.specs)

    def __iter__(self) -> Iterator[AbstractFeatureSpec]:

        return iter(self.specs.values())

    def __getitem__(self, item) -> Optional[AbstractFeatureSpec]:
        if type(item) is str:

            return self.specs[item]

        elif isinstance(item, AbstractFeatureSpec):

            return self.specs[item.label]

    def labels(self):

        return [key for key in self.specs.keys()]

    @classmethod
    def from_raw(cls, raw: list[RawFeatureSpec]) -> FeatureSpecContainer:

        specs = OrderedDict(
            [(spec["label"], AbstractFeatureSpec.from_raw(spec)) for spec in raw]
        )
        return cls(specs=specs)

    def to_raw(self) -> list[RawFeatureSpec]:

        return [spec.to_raw() for spec in self.specs.values()]


@dataclass(frozen=True)
class ObservationSpec:

    name: PayloadSpecLabel

    type: ObservationType

    specs: FeatureSpecContainer

    description: Optional[str] = field(default=None)

    @classmethod
    def from_raw(cls, name: str, raw: RawObservationSpec) -> ObservationSpec:

        type = ObservationType(raw["type"])

        specs = FeatureSpecContainer.from_raw(raw["features"])

        description = None

        if "description" in raw:

            description = raw["description"]

        return cls(name, type, specs, description)

    def to_raw(self) -> RawObservationSpec:

        raw = RawObservationSpec(type=self.type.value, features=self.specs.to_raw())

        if self.description is not None:

            raw["description"] = self.description

        return raw


@dataclass(frozen=True)
class ObservationSpecContainer(Collection):

    specs: dict[str, ObservationSpec] = field(default_factory=dict)

    def __contains__(self, item: object) -> bool:
        if type(item) is str:
            return item in self.specs

        elif isinstance(item, ObservationSpec):
            return item.name in self.specs

        return False

    def __len__(self) -> int:
        return len(self.specs)

    def __iter__(self) -> Iterator[ObservationSpec]:

        return iter(self.specs.values())

    def __getitem__(self, item) -> Optional[ObservationSpec]:
        if type(item) is str:

            return self.specs[item]

        elif isinstance(item, ObservationSpec):

            return self.specs[item.name]

    def labels(self) -> list[str]:

        return [key for key in self.specs.keys()]

    def items(self):
        return self.specs.items()

    @classmethod
    def from_raw(cls, raw: RawPayloadHeader) -> ObservationSpecContainer:
        return cls(
            specs={
                name: ObservationSpec.from_raw(name, spec) for name, spec in raw.items()
            }
        )

    def to_raw(self) -> RawPayloadHeader:

        return RawPayloadHeader(
            {name: spec.to_raw() for name, spec in self.specs.items()}
        )


PayloadSpecDict: TypeAlias = dict[str, ObservationSpec]

MetadataDict: TypeAlias = dict[str, str]


@dataclass(frozen=True)
class MetadataCollection(Collection):

    meta: dict[str, str]

    def __contains__(self, item: str) -> bool:
        if item in self.meta:
            return item in self.meta

        values = [val.lower() for val in self.meta.values()]
        return item.lower() in values

    def __len__(self) -> int:
        return len(self.meta)

    def __iter__(self) -> Iterator[tuple[str, str]]:

        return iter([(k, v) for k, v in self.meta.items()])

    def __getitem__(self, item) -> Optional[str]:
        if type(item) is str:

            return self.meta[item]

    @classmethod
    def from_raw(cls, raw: RawMetadataHeader) -> MetadataCollection:

        return cls(meta=raw)

    def to_raw(self) -> RawMetadataHeader:

        return RawMetadataHeader(self.meta.copy())


@dataclass(frozen=True)
class ConfmodHeader:

    obs: ObservationSpecContainer

    meta: MetadataDict

    @classmethod
    def from_raw(cls, raw: RawConfmodHeader) -> ConfmodHeader:

        specs = ObservationSpecContainer.from_raw(raw["observations"])

        meta = raw["metadata"]

        return cls(specs, meta)

    def to_raw(self) -> RawConfmodHeader:

        return RawConfmodHeader(
            observations=self.obs.to_raw(),
            # TODO: Metadata collection
            metadata=RawMetadataHeader(self.meta.copy()),
        )
