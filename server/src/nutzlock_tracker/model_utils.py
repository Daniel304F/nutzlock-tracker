from datetime import UTC, datetime
from uuid import uuid4


def make_uuid() -> str:
    return str(uuid4())


def utc_timestamp() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")
