from __future__ import annotations

from typing import Optional, TextIO
import click
import pydantic
import yaml

from confmod.config.config import ConfmodConfig, FeatureConfig, FeatureMetadataConfig, ObservationConfig, ScopeConfig
from confmod.io import model_from_json_stream
from confmod.model.header import FeatureSpec, ObservationSpec
from confmod.model.spec import BrideModel

from ..utils import check_tty
from ..exit_codes import ExitCode

@click.command()
@click.argument("input", type=click.File("r"))
@click.option(
    "-o",
    "--output",
    type=click.Path(dir_okay=True, resolve_path=True),
    help="Destination of the generated config file.",
    show_default="STDOUT",
)
@click.option(
    "-i",
    "--interactive/--no-interactive",
    "interactive",
    is_flag=True,
    help="Run in interactive mode, allowing the config to be fine tuned.",
    is_eager=True,
    callback=check_tty,
    default=True,
)
@click.option("-s", "--scope", "scopes", multiple=True)
@click.pass_context
def generate_config_cmd(
    ctx: click.Context,
    input: TextIO,
    output,
    interactive: bool,
    scopes: list[str],
):
    click.echo("generate_config was called")
    click.echo(f"Interactive mode enabled? {interactive}")
    try:
        model = model_from_json_stream(input)
        click.echo("Model successfully deserialized")
    except IOError as e:
        click.echo(e.strerror, err=True)
        ctx.exit(ExitCode.IO_ERROR.value)
    except pydantic.ValidationError as e:
        errMsg = f"Input file is not a valid BridgeModel\n{e.errors()}"
        click.echo(errMsg, err=True)
        ctx.exit(ExitCode.VALIDATION_ERROR.value)
    finally:
        input.close()

    metadata = model.head.meta
    observations = model.head.obs

    # scopes_dict = {[(scope)]}
    # jsonStr = json.dumps(model.to_raw())
    # click.echo(jsonStr)

    scope_cfgs = dict([(scope, create_scope_config(model, scope)) for scope in scopes])
    cfg = ConfmodConfig(scopes=scope_cfgs)

    with open(output, "w") as out_file:
        yaml.dump(cfg.to_raw(), out_file)

    click.echo("Successfully created config file")


def create_scope_config(
    model: BrideModel,
    scope_name: Optional[str],
    metadata: str | list[str] | bool = True,
    payload: bool = True,
) -> ScopeConfig:
    if scope_name is None:
        scope_name = "i_must_generate_a_random_string_here"
    if type(metadata) is str or isinstance(metadata, str):
        metadata = [s.strip() for s in metadata.split(",")]
    elif type(metadata) is bool or isinstance(metadata, bool):
        metadata = [key for key in model.head.meta.keys()]

    observations = dict(
        [
            (observation.name, create_observation_config(observation))
            for observation in model.head.obs
        ]
    )

    return ScopeConfig(
        identifier=scope_name,
        includePayload=payload,
        metadata=metadata,
        observations=observations,
    )


def create_observation_config(observation: ObservationSpec) -> ObservationConfig:
    return ObservationConfig(
        label=observation.name,
        includeMetadata=True,
        includePayload=True,
        features=dict(
            [
                (feature.label, create_feature_config(feature))
                for feature in observation.specs
            ]
        ),
    )


def create_feature_config(feature: FeatureSpec) -> FeatureConfig:
    return FeatureConfig(
        name=feature.label,
        include_payload=True,
        metadata=FeatureMetadataConfig(includeDataType=True, includeValueRange=True),
    )
