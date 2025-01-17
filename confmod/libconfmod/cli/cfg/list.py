from __future__ import annotations
from typing import TextIO

import click

@click.command()
@click.argument("config", type=click.File("r"))
def list_scopes_cmd(config: TextIO):
    ...

@click.command()
def list_config_cmd():
    ...