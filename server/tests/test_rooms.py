from collections.abc import AsyncIterator
from dataclasses import dataclass
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from nutzlock_tracker.database import Base, get_db
from nutzlock_tracker.main import create_app


@dataclass(frozen=True)
class ApiHarness:
    client: AsyncClient
    session_factory: async_sessionmaker[AsyncSession]


@pytest.fixture
async def harness(tmp_path: Path) -> AsyncIterator[ApiHarness]:
    app = create_app(init_database=False)
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'rooms-test.db'}"
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


async def create_soullink_run(test_client: AsyncClient) -> dict[str, object]:
    response = await test_client.post(
        "/api/v1/runs",
        json={
            "challenge_mode": "soullink",
            "game_version_ref": "heartgold",
            "is_randomizer": False,
            "name": "HeartGold shared",
            "player_count": 2,
        },
    )

    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_read_room_returns_safe_room_membership(harness: ApiHarness) -> None:
    run = await create_soullink_run(harness.client)

    response = await harness.client.get(f"/api/v1/rooms/{run['room_id']}")

    assert response.status_code == 200
    room = response.json()
    assert room["id"] == run["room_id"]
    assert room["run_id"] == run["id"]
    assert room["join_code"]
    assert "password_hash" not in room
    assert "reset_token_hash" not in room
    assert room["members"] == [
        {
            "display_name": "Spieler 1",
            "id": room["created_by_member_id"],
            "joined_at": room["members"][0]["joined_at"],
            "last_seen_at": None,
            "role": "owner",
        },
    ]


@pytest.mark.asyncio
async def test_join_room_by_join_code_adds_partner_member(harness: ApiHarness) -> None:
    run = await create_soullink_run(harness.client)
    room_response = await harness.client.get(f"/api/v1/rooms/{run['room_id']}")
    join_code = room_response.json()["join_code"]

    response = await harness.client.post(
        "/api/v1/rooms/join",
        json={
            "display_name": "Sam",
            "join_code": join_code,
        },
    )

    assert response.status_code == 201
    joined = response.json()
    assert joined["member"]["display_name"] == "Sam"
    assert joined["member"]["role"] == "partner"
    assert joined["room"]["id"] == run["room_id"]
    assert [member["display_name"] for member in joined["room"]["members"]] == [
        "Spieler 1",
        "Sam",
    ]


@pytest.mark.asyncio
async def test_join_room_rejects_unknown_join_code(harness: ApiHarness) -> None:
    response = await harness.client.post(
        "/api/v1/rooms/join",
        json={
            "display_name": "Sam",
            "join_code": "NOPE1234",
        },
    )

    assert response.status_code == 404
