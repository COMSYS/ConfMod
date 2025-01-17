from collections.abc import Iterable
from typing import TypeVar, Optional

T = TypeVar("T")


def take_first(i: Iterable[T]) -> Optional[T]:
    next(iter(i), None)
