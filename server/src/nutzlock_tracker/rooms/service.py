from secrets import choice

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.model_utils import utc_timestamp
from nutzlock_tracker.rooms.models import Member, Room
from nutzlock_tracker.rooms.schemas import MemberResponse, RoomResponse
from nutzlock_tracker.runs.models import Run

JOIN_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
JOIN_CODE_LENGTH = 10
OWNER_DISPLAY_NAME = "Spieler 1"


async def create_room_for_run(session: AsyncSession, run_id: str) -> tuple[Room, Member]:
    room = Room(
        join_code=await generate_unique_join_code(session),
        run_id=run_id,
    )
    session.add(room)
    await session.flush()

    owner = Member(
        display_name=OWNER_DISPLAY_NAME,
        role="owner",
        room_id=room.id,
    )
    session.add(owner)
    await session.flush()

    room.created_by_member_id = owner.id
    room.updated_at = utc_timestamp()
    return room, owner


async def generate_unique_join_code(session: AsyncSession) -> str:
    for _ in range(10):
        join_code = "".join(choice(JOIN_CODE_ALPHABET) for _ in range(JOIN_CODE_LENGTH))
        existing_room = await session.scalar(select(Room.id).where(Room.join_code == join_code))

        if existing_room is None:
            return join_code

    raise RuntimeError("Could not generate a unique room join code")


async def get_room_response(session: AsyncSession, room_id: str) -> RoomResponse:
    room = await session.get(Room, room_id)

    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

    return await build_room_response(session, room)


async def join_room(
    session: AsyncSession,
    join_code: str,
    display_name: str,
) -> tuple[RoomResponse, Member]:
    room = await session.scalar(
        select(Room).where(
            Room.join_code == join_code.upper(),
            Room.join_code_revoked_at.is_(None),
        ),
    )

    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        )

    run = await session.get(Run, room.run_id)

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found",
        )

    members = await list_room_members(session, room.id)
    writable_members = [member for member in members if member.role in {"owner", "partner"}]

    if len(writable_members) >= run.player_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room is full",
        )

    member = Member(
        display_name=display_name,
        role="partner",
        room_id=room.id,
    )
    room.updated_at = utc_timestamp()
    session.add(member)
    await session.commit()
    await session.refresh(member)
    await session.refresh(room)

    return await build_room_response(session, room), member


async def list_room_members(session: AsyncSession, room_id: str) -> list[Member]:
    result = await session.scalars(
        select(Member).where(Member.room_id == room_id).order_by(Member.joined_at.asc()),
    )
    return list(result)


async def build_room_response(session: AsyncSession, room: Room) -> RoomResponse:
    members = await list_room_members(session, room.id)
    return RoomResponse(
        created_at=room.created_at,
        created_by_member_id=room.created_by_member_id,
        id=room.id,
        join_code=room.join_code,
        join_code_revoked_at=room.join_code_revoked_at,
        members=[MemberResponse.model_validate(member) for member in members],
        read_only_token=room.read_only_token,
        run_id=room.run_id,
        updated_at=room.updated_at,
    )
