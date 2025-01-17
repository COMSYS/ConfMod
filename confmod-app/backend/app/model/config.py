from typing import List
from sqlalchemy import ForeignKey, PickleType, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from libconfmod.config.config import ConfmodConfig
from ..db import SqlBase


class PickledConfmodConfig(SqlBase):
    __tablename__ = "configs_pickled"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    slug: Mapped[str] = mapped_column(unique=True)
    config: Mapped[dict] = mapped_column(JSON)
    # config: Mapped[MutableValue[ConfmodConfig]] = mapped_column(MutableValue.as_mutable(PickleType))

""" class DBConfmodConfig(SqlBase):
    __tablename__ = "configs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(unique=True)
    slug: Mapped[str] = mapped_column(unique=True)
    scopes: Mapped[List["DBConfmodConfigScope"]] = relationship()

class DBConfmodConfigScope(SqlBase):
    __tablename__ = "config_scopes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    config_id: Mapped[int] = mapped_column(ForeignKey("configs.id"))
    identifier: Mapped[str]
    include_payload: Mapped[bool] = mapped_column(default=False)
    inlcuded_metadata: Mapped[List[str]] = mapped_column(MutableList.as_mutable(PickleType), default=[])

class DBConfmodConfigObservation(SqlBase):
    __tablename__ = "config_observations"

    scope_id: Mapped[int] = mapped_column(ForeignKey("config_scopes.id"))
    include_metadata: Mapped[bool] = mapped_column(default=False)
    include_payload: Mapped[bool] = mapped_column(default=False)
    features: Mapped[List["DBConfmodConfigFeature"]] = relationship()

class DBConfmodConfigFeature(SqlBase):
    __tablename__ = "config_features"

    observation_id: Mapped[int] = mapped_column(ForeignKey("config_observations"))
    data_type: Mapped[bool] = mapped_column(default=False)
    unit: Mapped[bool] = mapped_column(defaulf=False)
    value_range: Mapped[bool] = mapped_column(default=False)
    mean: Mapped[bool] = mapped_column(default=False) """
