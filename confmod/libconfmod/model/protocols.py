from __future__ import annotations

from typing import Protocol, runtime_checkable, TypeVar, Generic, Tuple
from collections.abc import Iterable
from abc import abstractmethod
from datetime import datetime


T = TypeVar("T", int, float, datetime, covariant=True)


@runtime_checkable
class RangedValues(Protocol, Generic[T]):
    def min(self) -> T:  # type: ignore
        ...

    def max(self) -> T:  # type: ignore
        ...


T = TypeVar("T")


@runtime_checkable
class RawRangedValues(Protocol[T]):
    value_range: tuple[T, T]


TAgg = TypeVar("TAgg")


@runtime_checkable
class Aggregator(Protocol[T]):

    @abstractmethod
    def aggregate(self) -> TAgg: ...

TRow = TypeVar("TRow")

@runtime_checkable
class DbFetcher(Protocol[TRow]):

    @abstractmethod
    def fetch(self) -> Iterable[TRow]:
        ...