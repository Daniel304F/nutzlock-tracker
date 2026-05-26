from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from nutzlock_tracker.database import Base
from nutzlock_tracker.model_utils import make_uuid, utc_timestamp


class LocationSlot(Base):
    __tablename__ = "location_slots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=make_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    game_version_ref: Mapped[str | None] = mapped_column(String(80), nullable=True)
    reference_location_ref: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_custom: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False, default=utc_timestamp)
    updated_at: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=utc_timestamp,
        onupdate=utc_timestamp,
    )


class Encounter(Base):
    __tablename__ = "encounters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=make_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id"), nullable=False, index=True)
    location_slot_id: Mapped[str] = mapped_column(
        ForeignKey("location_slots.id"),
        nullable=False,
        index=True,
    )
    member_id: Mapped[str | None] = mapped_column(ForeignKey("members.id"), nullable=True)
    species_ref: Mapped[str | None] = mapped_column(String(80), nullable=True)
    nickname: Mapped[str | None] = mapped_column(String(80), nullable=True)
    encounter_status: Mapped[str] = mapped_column(String(32), nullable=False)
    level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(16), nullable=True)
    nature: Mapped[str | None] = mapped_column(String(80), nullable=True)
    ability: Mapped[str | None] = mapped_column(String(80), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False, default=utc_timestamp)
    updated_at: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=utc_timestamp,
        onupdate=utc_timestamp,
    )
