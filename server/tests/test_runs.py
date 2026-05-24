from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from nutzlock_tracker.database import Base, get_db
from nutzlock_tracker.main import create_app


@pytest.fixture
async def client(tmp_path: Path) -> AsyncIterator[AsyncClient]:
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
        yield test_client

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
        },
    )

    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_create_run_persists_core_fields(client: AsyncClient) -> None:
    run = await create_run(client)

    assert run["id"]
    assert run["name"] == "Heartgold w/ Sam"
    assert run["challenge_mode"] == "soullink"
    assert run["is_randomizer"] is True
    assert run["game_version_ref"] == "heartgold"
    assert run["status"] == "active"
    assert run["ruleset_id"]
    assert run["room_id"] is None
    assert run["randomizer_config_id"] is None
    assert run["created_at"]
    assert run["updated_at"]


@pytest.mark.asyncio
async def test_list_runs_returns_newest_first(client: AsyncClient) -> None:
    first = await create_run(client, "First run")
    second = await create_run(client, "Second run")

    response = await client.get("/api/v1/runs")

    assert response.status_code == 200
    assert [run["id"] for run in response.json()] == [second["id"], first["id"]]


@pytest.mark.asyncio
async def test_create_run_rejects_blank_name(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/runs",
        json={
            "challenge_mode": "nuzlocke",
            "game_version_ref": "emerald",
            "is_randomizer": False,
            "name": "   ",
        },
    )

    assert response.status_code == 422
