from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from nutzlock_tracker.database import Base
from nutzlock_tracker.model_utils import make_uuid, utc_timestamp


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=make_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    challenge_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    is_randomizer: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    game_version_ref: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    room_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    ruleset_id: Mapped[str] = mapped_column(String(36), nullable=False, default=make_uuid)
    randomizer_config_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False, default=utc_timestamp)
    updated_at: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=utc_timestamp,
        onupdate=utc_timestamp,
    )
