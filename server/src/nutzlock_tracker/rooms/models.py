from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from nutzlock_tracker.database import Base
from nutzlock_tracker.model_utils import make_uuid, utc_timestamp


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=make_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id"), nullable=False)
    join_code: Mapped[str] = mapped_column(String(24), nullable=False, unique=True, index=True)
    join_code_revoked_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
    read_only_token: Mapped[str | None] = mapped_column(String(80), nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reset_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    reset_token_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reset_token_expires_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_by_member_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False, default=utc_timestamp)
    updated_at: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=utc_timestamp,
        onupdate=utc_timestamp,
    )


class Member(Base):
    __tablename__ = "members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=make_uuid)
    room_id: Mapped[str] = mapped_column(ForeignKey("rooms.id"), nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(80), nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    local_identity_key_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    joined_at: Mapped[str] = mapped_column(String(32), nullable=False, default=utc_timestamp)
    last_seen_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
