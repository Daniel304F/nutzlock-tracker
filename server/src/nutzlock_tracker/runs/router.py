from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.database import get_db
from nutzlock_tracker.runs import service
from nutzlock_tracker.runs.schemas import RunCreate, RunResponse

router = APIRouter(prefix="/runs", tags=["runs"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get(
    "",
    response_model=list[RunResponse],
    status_code=status.HTTP_200_OK,
    summary="List runs",
)
async def read_runs(session: DbSession) -> list[RunResponse]:
    return await service.list_runs(session)


@router.post(
    "",
    response_model=RunResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a run",
)
async def create_run(payload: RunCreate, session: DbSession) -> RunResponse:
    return await service.create_run(session, payload)
