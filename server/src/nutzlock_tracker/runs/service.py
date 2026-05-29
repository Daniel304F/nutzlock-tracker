from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.model_utils import make_uuid
from nutzlock_tracker.rooms.service import create_room_for_run
from nutzlock_tracker.rules.service import build_default_ruleset
from nutzlock_tracker.runs.models import Run
from nutzlock_tracker.runs.schemas import ChallengeMode, RunCreate


async def create_run(session: AsyncSession, payload: RunCreate) -> Run:
    run_id = make_uuid()
    ruleset_id = make_uuid()
    run = Run(
        challenge_mode=payload.challenge_mode.value,
        game_version_ref=payload.game_version_ref,
        id=run_id,
        is_randomizer=payload.is_randomizer,
        name=payload.name,
        notes=payload.notes,
        player_count=payload.player_count,
        ruleset_id=ruleset_id,
    )
    ruleset = build_default_ruleset(run_id=run_id, ruleset_id=ruleset_id)

    session.add_all([run, ruleset])

    if payload.challenge_mode == ChallengeMode.soullink:
        room, _ = await create_room_for_run(session, run_id)
        run.room_id = room.id

    await session.commit()
    await session.refresh(run)
    return run


async def list_runs(session: AsyncSession) -> list[Run]:
    result = await session.scalars(select(Run).order_by(Run.updated_at.desc()))
    return list(result)


async def get_run(session: AsyncSession, run_id: str) -> Run:
    run = await session.get(Run, run_id)

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found",
        )

    return run
