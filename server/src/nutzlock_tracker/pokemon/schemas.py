from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class RosterStatus(StrEnum):
    team = "team"
    box = "box"
    graveyard = "graveyard"


class LifeStatus(StrEnum):
    alive = "alive"
    dead = "dead"
    released = "released"


class DeathSource(StrEnum):
    manual = "manual"
    partner_death = "partner_death"
    system = "system"


class PokemonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime
    current_level: int | None
    death_at: datetime | None
    death_cause: str | None
    death_source: DeathSource | None
    encounter_id: str
    id: str
    life_status: LifeStatus
    nickname: str | None
    notes: str | None
    owner_member_id: str | None
    randomized_overrides: dict[str, object] | None
    roster_status: RosterStatus
    run_id: str
    species_ref: str
    updated_at: datetime
