from typing import List, Optional
import caseconverter
from sqlalchemy import ForeignKey, Enum as SqlEnum, UniqueConstraint, PrimaryKeyConstraint, PickleType, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.mutable import MutableList
import decimal
from ..db import SqlBase
from libconfmod.model.header import FeatureSpec, ObservationType, ObservationSpec
from libconfmod.model.spec import ConfmodModel

class PickledConfmodModel(SqlBase):
    __tablename__ = "models_pickled"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    slug: Mapped[str] = mapped_column(unique=True)
    json_model: Mapped[dict] = mapped_column(JSON)
    categories: Mapped[List[str]] = mapped_column(MutableList.as_mutable(PickleType), default=[])
