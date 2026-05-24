from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ChallengeMode(StrEnum):
    nuzlocke = "nuzlocke"
    soullink = "soullink"


class RunStatus(StrEnum):
    active = "active"
    archived = "archived"
    completed_victory = "completed_victory"
    failed_wipeout = "failed_wipeout"


class RunCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    challenge_mode: ChallengeMode
    game_version_ref: str = Field(min_length=1, max_length=80)
    is_randomizer: bool = False
    name: str = Field(min_length=1, max_length=120)
    notes: str | None = Field(default=None, max_length=2_000)

    @field_validator("name", "game_version_ref")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not value:
            raise ValueError("Field cannot be blank")

        return value

    @field_validator("notes")
    @classmethod
    def normalize_blank_notes(cls, value: str | None) -> str | None:
        if value is None:
            return None

        return value or None


class RunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    challenge_mode: ChallengeMode
    created_at: datetime
    game_version_ref: str
    id: str
    is_randomizer: bool
    name: str
    notes: str | None
    randomizer_config_id: str | None
    room_id: str | None
    ruleset_id: str
    status: RunStatus
    updated_at: datetime
