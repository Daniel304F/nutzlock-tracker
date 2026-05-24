from collections.abc import AsyncIterator
from dataclasses import dataclass
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from nutzlock_tracker.database import Base, get_db
from nutzlock_tracker.main import create_app
from nutzlock_tracker.rules.models import Ruleset


@dataclass(frozen=True)
class ApiHarness:
    client: AsyncClient
    session_factory: async_sessionmaker[AsyncSession]


@pytest.fixture
async def harness(tmp_path: Path) -> AsyncIterator[ApiHarness]:
    app = create_app(init_database=False)
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'runs-test.db'}"
    engine = create_async_engine(database_url)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async def override_get_db() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as test_client:
        yield ApiHarness(client=test_client, session_factory=session_factory)

    await engine.dispose()


async def create_run(test_client: AsyncClient, name: str = "Heartgold w/ Sam") -> dict[str, object]:
    response = await test_client.post(
        "/api/v1/runs",
        json={
            "challenge_mode": "soullink",
            "game_version_ref": "heartgold",
            "is_randomizer": True,
            "name": name,
            "notes": "First shared run.",
            "player_count": 2,
        },
    )

    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_create_run_persists_core_fields(harness: ApiHarness) -> None:
    run = await create_run(harness.client)

    assert run["id"]
    assert run["name"] == "Heartgold w/ Sam"
    assert run["challenge_mode"] == "soullink"
    assert run["is_randomizer"] is True
    assert run["player_count"] == 2
    assert run["game_version_ref"] == "heartgold"
    assert run["status"] == "active"
    assert run["ruleset_id"]
    assert run["room_id"] is None
    assert run["randomizer_config_id"] is None
    assert run["created_at"]
    assert run["updated_at"]


@pytest.mark.asyncio
async def test_create_run_persists_default_ruleset(harness: ApiHarness) -> None:
    run = await create_run(harness.client)

    async with harness.session_factory() as session:
        ruleset = await session.scalar(
            select(Ruleset).where(Ruleset.id == run["ruleset_id"]),
        )

    assert ruleset is not None
    assert ruleset.run_id == run["id"]
    assert ruleset.standard_rules == "standard_nuzlocke"
    assert ruleset.clauses == {
        "dupes": True,
        "gift_static_counts": True,
        "nickname": True,
        "no_battle_items": False,
        "set_battle_style": "set",
        "shiny": True,
        "species": False,
    }
    assert ruleset.custom_rules == []
    assert ruleset.level_cap_enabled is True
    assert ruleset.level_cap_source == "milestone"
    assert ruleset.death_propagation_mode == "full_link"


@pytest.mark.asyncio
async def test_list_runs_returns_newest_first(harness: ApiHarness) -> None:
    first = await create_run(harness.client, "First run")
    second = await create_run(harness.client, "Second run")

    response = await harness.client.get("/api/v1/runs")

    assert response.status_code == 200
    assert [run["id"] for run in response.json()] == [second["id"], first["id"]]


@pytest.mark.asyncio
async def test_create_run_rejects_blank_name(harness: ApiHarness) -> None:
    response = await harness.client.post(
        "/api/v1/runs",
        json={
            "challenge_mode": "nuzlocke",
            "game_version_ref": "emerald",
            "is_randomizer": False,
            "name": "   ",
        },
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_run_defaults_player_count_to_one(harness: ApiHarness) -> None:
    response = await harness.client.post(
        "/api/v1/runs",
        json={
            "challenge_mode": "nuzlocke",
            "game_version_ref": "emerald",
            "is_randomizer": False,
            "name": "Emerald solo",
        },
    )

    assert response.status_code == 201
    assert response.json()["player_count"] == 1


@pytest.mark.asyncio
async def test_create_run_rejects_zero_player_count(harness: ApiHarness) -> None:
    response = await harness.client.post(
        "/api/v1/runs",
        json={
            "challenge_mode": "soullink",
            "game_version_ref": "heartgold",
            "is_randomizer": False,
            "name": "Bad run",
            "player_count": 0,
        },
    )

    assert response.status_code == 422
