from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.runs.models import Run
from nutzlock_tracker.runs.schemas import RunCreate


async def create_run(session: AsyncSession, payload: RunCreate) -> Run:
    run = Run(
        challenge_mode=payload.challenge_mode.value,
        game_version_ref=payload.game_version_ref,
        is_randomizer=payload.is_randomizer,
        name=payload.name,
        notes=payload.notes,
    )

    session.add(run)
    await session.commit()
    await session.refresh(run)
    return run


async def list_runs(session: AsyncSession) -> list[Run]:
    result = await session.scalars(select(Run).order_by(Run.updated_at.desc()))
    return list(result)
