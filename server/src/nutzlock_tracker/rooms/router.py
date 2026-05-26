from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.database import get_db
from nutzlock_tracker.rooms import service
from nutzlock_tracker.rooms.schemas import RoomJoin, RoomJoinResponse, RoomResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.post(
    "/join",
    response_model=RoomJoinResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Join a room by join code",
)
async def join_room(payload: RoomJoin, session: DbSession) -> RoomJoinResponse:
    room, member = await service.join_room(
        session=session,
        display_name=payload.display_name,
        join_code=payload.join_code,
    )
    return RoomJoinResponse(room=room, member=member)


@router.get(
    "/{room_id}",
    response_model=RoomResponse,
    status_code=status.HTTP_200_OK,
    summary="Read a room",
)
async def read_room(room_id: str, session: DbSession) -> RoomResponse:
    return await service.get_room_response(session, room_id)
