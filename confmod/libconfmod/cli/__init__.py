from .entrypoint import cli

# Register subcommands
from .cfg.entrypoint import cfg_subcmd
cli.add_command(cfg_subcmd, "config")