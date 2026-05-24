from sqlalchemy import JSON, Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from nutzlock_tracker.database import Base
from nutzlock_tracker.model_utils import make_uuid, utc_timestamp


class Ruleset(Base):
    __tablename__ = "rulesets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=make_uuid)
    run_id: Mapped[str] = mapped_column(ForeignKey("runs.id"), nullable=False)
    standard_rules: Mapped[str] = mapped_column(String(80), nullable=False)
    clauses: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False)
    custom_rules: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    level_cap_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False)
    level_cap_source: Mapped[str | None] = mapped_column(String(32), nullable=True)
    death_propagation_mode: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[str] = mapped_column(String(32), nullable=False, default=utc_timestamp)
    updated_at: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=utc_timestamp,
        onupdate=utc_timestamp,
    )
