import logging
import sys
from app.core.config import get_settings

settings = get_settings()

LOG_FORMAT = "%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"


def setup_logging() -> logging.Logger:
    """Configures root and application loggers."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    logger = logging.getLogger("sales_platform")
    logger.setLevel(log_level)
    return logger


logger = setup_logging()
