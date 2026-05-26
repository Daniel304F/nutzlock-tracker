from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from nutzlock_tracker.pokemon.schemas import PokemonResponse
from nutzlock_tracker.rooms.schemas import RoomResponse
from nutzlock_tracker.runs.schemas import RunResponse


class EncounterStatus(StrEnum):
    caught = "caught"
    failed = "failed"
    fled = "fled"
    killed_before_catch = "killed_before_catch"
    missed = "missed"
    dupe_skipped = "dupe_skipped"


class Gender(StrEnum):
    female = "female"
    genderless = "genderless"
    male = "male"
    unknown = "unknown"


class WarningSeverity(StrEnum):
    warning = "warning"


class RuleWarningResponse(BaseModel):
    code: str
    message: str
    severity: WarningSeverity = WarningSeverity.warning


class LocationSlotCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    game_version_ref: str | None = Field(default=None, max_length=80)
    name: str = Field(min_length=1, max_length=120)
    reference_location_ref: str | None = Field(default=None, max_length=120)
    sort_order: int | None = Field(default=None, ge=1)

    @field_validator("game_version_ref", "name", "reference_location_ref")
    @classmethod
    def normalize_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        return value or None


class EncounterCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    ability: str | None = Field(default=None, max_length=80)
    encounter_status: EncounterStatus
    gender: Gender | None = None
    level: int | None = Field(default=None, ge=1, le=100)
    location_slot_id: str = Field(min_length=1, max_length=36)
    member_id: str | None = Field(default=None, max_length=36)
    nature: str | None = Field(default=None, max_length=80)
    nickname: str | None = Field(default=None, max_length=80)
    notes: str | None = Field(default=None, max_length=2_000)
    species_ref: str | None = Field(default=None, max_length=80)

    @field_validator("ability", "member_id", "nature", "nickname", "notes", "species_ref")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        return value or None

    @model_validator(mode="after")
    def require_species_for_caught_encounters(self) -> "EncounterCreate":
        if self.encounter_status == EncounterStatus.caught and not self.species_ref:
            raise ValueError("species_ref is required for caught encounters")

        return self


class EncounterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ability: str | None
    created_at: datetime
    encounter_status: EncounterStatus
    gender: Gender | None
    id: str
    level: int | None
    location_slot_id: str
    member_id: str | None
    nature: str | None
    nickname: str | None
    notes: str | None
    run_id: str
    species_ref: str | None
    updated_at: datetime


class EncounterWithPokemonResponse(EncounterResponse):
    pokemon: PokemonResponse | None


class LocationSlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime
    encounters: list[EncounterWithPokemonResponse] = Field(default_factory=list)
    game_version_ref: str | None
    id: str
    is_custom: bool
    name: str
    reference_location_ref: str | None
    run_id: str
    sort_order: int
    updated_at: datetime


class EncounterRecordResponse(BaseModel):
    encounter: EncounterResponse
    pokemon: PokemonResponse | None
    warnings: list[RuleWarningResponse]


class RunTrackerResponse(BaseModel):
    locations: list[LocationSlotResponse]
    room: RoomResponse | None
    run: RunResponse
