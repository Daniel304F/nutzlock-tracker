from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from nutzlock_tracker.database import Base
from nutzlock_tracker.model_utils import make_uuid, utc_timestamp


class Pokemon(Base):
    __tablename__ = "pokemon"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=make_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id"), nullable=False, index=True)
    encounter_id: Mapped[str] = mapped_column(
        ForeignKey("encounters.id"),
        nullable=False,
        index=True,
    )
    owner_member_id: Mapped[str | None] = mapped_column(ForeignKey("members.id"), nullable=True)
    species_ref: Mapped[str] = mapped_column(String(80), nullable=False)
    nickname: Mapped[str | None] = mapped_column(String(80), nullable=True)
    current_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    roster_status: Mapped[str] = mapped_column(String(24), nullable=False, default="box")
    life_status: Mapped[str] = mapped_column(String(24), nullable=False, default="alive")
    death_at: Mapped[str | None] = mapped_column(String(32), nullable=True)
    death_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    death_source: Mapped[str | None] = mapped_column(String(24), nullable=True)
    randomized_overrides: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False, default=utc_timestamp)
    updated_at: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=utc_timestamp,
        onupdate=utc_timestamp,
    )
