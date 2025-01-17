import click

from .exit_codes import ExitCode


def stdin_is_tty():
    """Checks if the stdin of the current process is attached to a terminal."""
    from sys import stdin
    return stdin.isatty()

def check_tty(ctx: click.Context, param, value):
    if value and not stdin_is_tty():
        click.echo("Interactive mode only works when attached to a terminal.", err=True)
        ctx.exit(ExitCode.NOT_ATTACHED_TO_TTY.value)
    return value