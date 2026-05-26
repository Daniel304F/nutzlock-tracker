from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MemberRole(StrEnum):
    owner = "owner"
    partner = "partner"
    viewer = "viewer"


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str
    id: str
    joined_at: datetime
    last_seen_at: datetime | None
    role: MemberRole


class RoomResponse(BaseModel):
    created_at: datetime
    created_by_member_id: str | None
    id: str
    join_code: str
    join_code_revoked_at: datetime | None
    members: list[MemberResponse]
    read_only_token: str | None
    run_id: str
    updated_at: datetime


class RoomJoin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    display_name: str = Field(min_length=1, max_length=80)
    join_code: str = Field(min_length=4, max_length=24)

    @field_validator("display_name", "join_code")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not value:
            raise ValueError("Field cannot be blank")

        return value

    @field_validator("join_code")
    @classmethod
    def normalize_join_code(cls, value: str) -> str:
        return value.upper()


class RoomJoinResponse(BaseModel):
    member: MemberResponse
    room: RoomResponse
