from __future__ import annotations

from typing import Any
from fastapi import APIRouter, UploadFile, Depends, HTTPException, status
from libconfmod.model.spec import ConfmodModel
from libconfmod.model.header import (
    ObservationSpec,
    FeatureDescriptiveMetadata,
    FeatureValueMetadata,
    TypedFeatureSpec,
)
from libconfmod.model.raw import RawConfmodModel
from libconfmod.config import ConfmodConfig
from libconfmod.io import model_from_json_stream
from libconfmod.config import ConfmodConfigGenerator
from libconfmod.config.config import ObservationConfig
from sqlalchemy.orm import Session
from sqlalchemy import update
import caseconverter

from ..error import JsonDecodeError
from ..db import get_db
from ..model.confmod import PickledConfmodModel
from ..schema.confmod import (
    ConfmodModelCreate,
    ConfmodModelGet,
    ConfmodModelObservationCreate,
    ConfmodModelUpdate,
    ConfmodModelFeatureMetadataCreate,
    ConfmodModelAddMetadata,
    ConfmodModelUpdateCategories
)
from ..schema.shared import AddObservaionOutput
from ..services import confmod_model_service, confmod_config_service

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/{slug}", response_model=ConfmodModelGet)
def get_model(slug: str, db: Session = Depends(get_db)):
    model = confmod_model_service.get_model_by_slug(slug, db)

    return ConfmodModelGet(model=model.to_raw())


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=RawConfmodModel)
def create_model(body: ConfmodModelCreate, db: Session = Depends(get_db)):
    logger.log(logging.INFO, "create_model")
    logger.log(logging.INFO, body.model["head"])
    confmod_model = ConfmodModel.from_raw(body.model)
    slug = caseconverter.kebabcase(body.name)
    db_model = PickledConfmodModel(
        name=body.name, slug=slug, json_model=confmod_model.to_raw()
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)

    return confmod_model.to_raw()

@router.post("/{slug}/observations", response_model=AddObservaionOutput)
def add_observeration(
    slug: str, body: ConfmodModelObservationCreate, db: Session = Depends(get_db)
) -> AddObservaionOutput:
    db_model = confmod_model_service.get_by_slug(slug, db)
    db_config = confmod_config_service.get_by_slug(slug, db)


    model = ConfmodModel.from_raw(db_model.json_model)
    model.head.obs.specs[body.label] = ObservationSpec.from_raw(
        body.label, body.observation
    )

    generator = ConfmodConfigGenerator(model)
    observation_config = generator.generate_observation_config(body.label)

    config = ConfmodConfig.from_raw(db_config.config)
    config.add_observation_config(body.label, ObservationConfig.from_raw(body.label, observation_config))

    db_model.json_model = model.to_raw()
    db_config.config = config.to_raw()

    db.add(db_model)
    db.add(db_config)
    db.commit()
    db.refresh(db_model)
    db.refresh(db_config)



    return AddObservaionOutput(
        name=db_model.name,
        observation_label=body.label,
        model_update=model.to_raw(),
        observation_config=observation_config,
    )


@router.delete("/{slug}/observations/{label}", response_model=ConfmodModelUpdate)
def delete_observation(slug: str, label: str, db: Session = Depends(get_db)):
    db_model = confmod_model_service.get_by_slug(slug, db)

    model = ConfmodModel.from_raw(db_model.json_model)
    observations = model.head.obs

    try:
        observations.specs.pop(label)
    except KeyError as ke:
        logging.warn(
            f'Model "{slug}" has no observation with label "{label}"', exc_info=ke
        )

    db_model.json_model = model.to_raw()
    db.add(db_model)
    db.commit()
    db.refresh(db_model)

    return ConfmodModelUpdate(name=db_model.name, model=model.to_raw())


@router.post(
    "/{slug}/observations/{obs_label}/features{feat_label}/metadata",
    response_model=ConfmodModelUpdate,
)
def add_feature_metadata(
    slug: str,
    obs_label: str,
    feat_label: str,
    body: ConfmodModelFeatureMetadataCreate,
    db: Session = Depends(get_db),
):
    db_model = confmod_model_service.get_by_slug(slug, db)
    model = ConfmodModel.from_raw(db_model.json_model)

    try:
        observation = model.head.obs[obs_label]
    except KeyError:
        raise HTTPException(
            status=status.HTTP_404_NOT_FOUND,
            detail=f'No Observation with label "{obs_label}"',
        )

    try:
        feature = observation.specs[feat_label]
    except KeyError:
        raise HTTPException(
            status=status.HTTP_404_NOT_FOUND,
            detail=f'No Feature with label "{feat_label}"',
        )

    if body.type == "descriptive":
        feature.descriptive_meta.append(
            FeatureDescriptiveMetadata(
                label=body.label, description=body.description, value=body.value
            )
        )
    elif body.type == "value":
        feature: TypedFeatureSpec[Any]
        feature.value_meta.append(
            FeatureValueMetadata(
                label=body.label, description=body.description, value=body.value
            )
        )

    db_model.json_model = model.to_raw()
    db.add(db_model)
    db.commit()
    db.refresh(db_model)

    return ConfmodModelUpdate(name=db_model.name, model=model.to_raw())


@router.delete(
    "/{slug}/observations/{obs_label}/features/{feat_label}/metadata/{meta_label}",
    response_model=ConfmodModelUpdate,
)
def delete_feature_metadata(
    slug: str,
    obs_label: str,
    feat_label: str,
    meta_label: str,
    db: Session = Depends(get_db),
):
    db_model = confmod_model_service.get_by_slug(slug, db)
    model = ConfmodModel.from_raw(db_model.json_model)

    try:
        observation = model.head.obs[obs_label]
    except KeyError:
        raise HTTPException(
            status=status.HTTP_404_NOT_FOUND,
            detail=f'No Observation with label "{obs_label}"',
        )

    try:
        feature = observation.specs[feat_label]
    except KeyError:
        raise HTTPException(
            status=status.HTTP_404_NOT_FOUND,
            detail=f'No Feature with label "{feat_label}"',
        )

    idx: int = -1
    for i, meta in enumerate(feature.descriptive_meta):
        if meta.label == meta_label:
            idx = i

    if idx > -1:
        feature.descriptive_meta.pop(idx)

    if isinstance(feature, TypedFeatureSpec):
        idx = -1
        for i, meta in enumerate(feature.value_meta):
            if meta.label == meta_label:
                idx = i

        if idx > -1:
            feature.value_meta.pop(idx)

    db_model.json_model = model.to_raw()
    db.add(db_model)
    db.commit()
    db.refresh(db_model)

    return ConfmodModelUpdate(name=db_model.name, model=model.to_raw())


@router.post("{slug}/metadata", response_model=ConfmodModelUpdate)
def add_model_metadata(slug: str, body: ConfmodModelAddMetadata, db: Session = Depends(get_db)):
    db_model = confmod_model_service.get_by_slug(slug, db)
    model = ConfmodModel.from_raw(db_model.json_model)

    if body.key in model.head.meta:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Modle \"{db_model.name}\" already has metadata with key \"{body.key}\"")

    model.head.meta[body.key] = body.value

    db.execute(
        update(PickledConfmodModel).where(PickledConfmodModel.id == db_model.id).values(json_model=model.to_raw())
    )

    db.commit()
    db.refresh(db_model)

    return ConfmodModelUpdate(name=db_model.name, model=db_model.json_model)

@router.delete("{slug}/metadata/{meta_key}", response_model=ConfmodModelUpdate)
def delete_model_metadata(slug: str, meta_key: str, db: Session = Depends(get_db)):
    db_model = confmod_model_service.get_by_slug(slug, db)
    model = ConfmodModel.from_raw(db_model.json_model)

    try:
        model.head.meta.pop(meta_key)
    except KeyError as ke:
        logger.warn(f"Model {slug} has no top level metadata with key \"{meta_key}\"", exc_info=ke)

    db.execute(
        update(PickledConfmodModel).where(PickledConfmodModel.id == db_model.id).values(json_model=model.to_raw())
    )
    db.commit()
    db.refresh(db_model)

    return ConfmodModelUpdate(name=db_model.name, model=db_model.json_model)


@router.post("/verify", responses={400: {"model": JsonDecodeError}})
def verify_model(file: UploadFile) -> RawConfmodModel:
    logging.log(logging.DEBUG, f"File uploaded: {file.size}")
    parsed_model = model_from_json_stream(file.file)
    return parsed_model.to_raw()

@router.get("/{slug}/export", response_model=ConfmodModelGet)
def export_model(slug: str, db: Session = Depends(get_db)):
    db_model = confmod_model_service.get_by_slug(slug, db)

    return ConfmodModelGet(model=db_model.json_model)

@router.get("{slug}/categories", response_model=list[str])
def get_model_categories(slug: str, db: Session = Depends(get_db)):
    db_model = confmod_model_service.get_by_slug(slug, db)
    categories = db_model.categories
    return categories

@router.put("{slug}/categories", status_code=status.HTTP_202_ACCEPTED, response_model=list[str])
def update_model_categories(slug: str, body: ConfmodModelUpdateCategories, db: Session = Depends(get_db)) -> list[str]:
    db_model = confmod_model_service.get_by_slug(slug, db)
    db_model.categories = body.categories
    db.add(db_model)
    db.commit()
    db.refresh(db_model)

    return db_model.categories
