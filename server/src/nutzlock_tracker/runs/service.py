from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.model_utils import make_uuid
from nutzlock_tracker.rules.service import build_default_ruleset
from nutzlock_tracker.runs.models import Run
from nutzlock_tracker.runs.schemas import RunCreate


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
    await session.commit()
    await session.refresh(run)
    return run


async def list_runs(session: AsyncSession) -> list[Run]:
    result = await session.scalars(select(Run).order_by(Run.updated_at.desc()))
    return list(result)
