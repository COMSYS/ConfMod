from abc import ABC, abstractmethod
from numbers import Number
import mimetypes
from typing import Type
from .raw import RawEnumDataType



class FeatureDataType(ABC):
    """
    Base class of all Feature Datatypes.
    """

    pass


class NumericFeatureType[N: Number](FeatureDataType, ABC):
    # Min and max are currently unused
    min: N | None
    max: N | None

    def __init__(self, min=None, max=None):
        super().__init__()
        self.min = min
        self.max = max

    def in_bounds(self, num: N) -> bool:
        """Determine if the argument is in bounds.

        Args:
            num (N): The number to check

        Returns:
            bool: True iff num in bounds
        """

        if self.min is None and self.max is None:
            return True

        if self.min is None:
            return num <= self.max

        if self.max is None:
            return self.min <= num

        return self.min <= num <= self.max

    @abstractmethod
    def to_raw(self):
        pass


class IntFeatureType(NumericFeatureType[int]):

    def to_raw(self):
        return "int"


class FloatFeatureType(NumericFeatureType[float]):

    def to_raw(self):
        return "float"


class StringFeatureType(FeatureDataType):
    # minLen and maxLen are currently unused
    minLen: int
    maxLen: int | None

    def __init__(self, minLen=0, maxLen=None):
        super().__init__()
        self.minLen = minLen
        self.maxLen = maxLen

    def to_raw(self):
        return "string"


class BooleanFeatureType(FeatureDataType):

    def to_raw(self):
        return "boolean"


class TimestampFeatureType(FeatureDataType):

    def to_raw(self):
        return "timestamp"


class EnumFeatureType(FeatureDataType):
    variants: list[str]

    def __init__(self, variants: list[str]):
        super().__init__()
        self.variants = variants

    def to_raw(self):
        return RawEnumDataType(
            type="enum",
            variants=self.variants,
        )


class FileFeatureType(FeatureDataType):
    extension: str
    mime_type: str

    def __init__(self, extension: str, mime_type: str):
        super().__init__()
        self.extension = extension
        self.mime_type = mime_type

    @classmethod
    def from_ext(cls: Type["FileFeatureType"] , extension: str):
        if not extension.startswith("."):
            extension = "." + extension

        mime_type = mimetypes.types_map.get(extension, mimetypes.common_types.get(extension))

        if mime_type is None:
            raise Exception("Unknown Mime Type")

        return cls(extension=extension, mime_type=mime_type)

    @classmethod
    def from_mime(cls: Type["FileFeatureType"], mime_type: str):
        extension = mimetypes.guess_extension(mime_type)

        if extension is None:
            raise Exception("Unknown Mime Type")

        return cls(extension=extension, mime_type=mime_type)