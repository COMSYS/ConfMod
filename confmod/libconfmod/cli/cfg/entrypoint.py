from __future__ import annotations

import click

from .generate import generate_config_cmd
from .list import list_config_cmd

@click.group()
def cfg_subcmd():
    pass

cfg_subcmd.add_command(generate_config_cmd, "generate")
cfg_subcmd.add_command(list_config_cmd, "ls")
