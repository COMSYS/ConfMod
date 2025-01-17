import os
from dotenv import load_dotenv
import logging

DEFAULT_PORT = 8080
DEFAULT_LISTEN_ADDR = "0.0.0.0"
DEFAULT_LOG_LEVEL = "INFO"
# The URL path where the api is served from. This path needs to be prefixed to all routes of this app.
DEFAULT_API_BASE_URL = "/api"

load_dotenv()


def get_config(key: str, default=None) -> str | None:
    """
    Gets a configuration value, prioritizing environment variables.
    Environment Variables can have a CONFMOD_ prefix to avoid conflicts.
    If there is no variable with the prefix, but one without the prefix, its value is returned instead.

    Args:
        key: The name of the configuration value.
        default: The default value if the key is not found.

    Returns:
        The configuration value.
    """
    key = key.upper()
    prefixed_key = f"CONFMOD_{key}"
    return os.getenv(prefixed_key, os.getenv(key, default))


def get_port() -> int:
    port = get_config("PORT")
    if port is not None:
        return int(port)
    return DEFAULT_PORT


def get_listen_addr() -> str:
    return get_config("LISTEN_ADDR") or DEFAULT_LISTEN_ADDR


def get_log_level() -> str:
    return get_config("LOG_LEVEL") or DEFAULT_LOG_LEVEL


def get_api_base_url() -> str:
    return get_config("API_BASE_URL") or DEFAULT_API_BASE_URL


def set_configured_log_level():
    """
    Sets the logging level based on a string.

    Args:
        log_level_str: The log level string (e.g., "DEBUG", "INFO", "WARNING").

    Raises:
        ValueError: If the provided log level string is invalid.
    """
    log_level = get_log_level()
    try:
        log_level = getattr(logging, log_level.upper())
    except AttributeError:
        raise ValueError(f"Invalid log level: {log_level}")

    logging.basicConfig(level=log_level)
