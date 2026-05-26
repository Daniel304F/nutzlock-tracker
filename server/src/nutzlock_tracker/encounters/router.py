from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.database import get_db
from nutzlock_tracker.encounters import service
from nutzlock_tracker.encounters.schemas import (
    EncounterCreate,
    EncounterRecordResponse,
    LocationSlotCreate,
    LocationSlotResponse,
    RunTrackerResponse,
)

router = APIRouter(prefix="/runs/{run_id}", tags=["encounters"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get(
    "/tracker",
    response_model=RunTrackerResponse,
    status_code=status.HTTP_200_OK,
    summary="Read tracker state for a run",
)
async def read_run_tracker(run_id: str, session: DbSession) -> RunTrackerResponse:
    return await service.get_run_tracker(session, run_id)


@router.post(
    "/locations",
    response_model=LocationSlotResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a manual location slot",
)
async def create_location_slot(
    run_id: str,
    payload: LocationSlotCreate,
    session: DbSession,
) -> LocationSlotResponse:
    return await service.create_location_slot(session, run_id, payload)


@router.post(
    "/encounters",
    response_model=EncounterRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record an encounter",
)
async def record_encounter(
    run_id: str,
    payload: EncounterCreate,
    session: DbSession,
) -> EncounterRecordResponse:
    return await service.record_encounter(session, run_id, payload)
