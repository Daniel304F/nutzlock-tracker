from collections.abc import AsyncIterator
from dataclasses import dataclass
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from nutzlock_tracker.database import Base, get_db
from nutzlock_tracker.main import create_app
from nutzlock_tracker.pokemon.models import Pokemon


@dataclass(frozen=True)
class ApiHarness:
    client: AsyncClient
    session_factory: async_sessionmaker[AsyncSession]


@pytest.fixture
async def harness(tmp_path: Path) -> AsyncIterator[ApiHarness]:
    app = create_app(init_database=False)
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'encounters-test.db'}"
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


async def create_solo_run(test_client: AsyncClient) -> dict[str, object]:
    response = await test_client.post(
        "/api/v1/runs",
        json={
            "challenge_mode": "nuzlocke",
            "game_version_ref": "emerald",
            "is_randomizer": False,
            "name": "Emerald solo",
        },
    )

    assert response.status_code == 201
    return response.json()


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


async def create_location(test_client: AsyncClient, run_id: str, name: str = "Route 101") -> dict:
    response = await test_client.post(
        f"/api/v1/runs/{run_id}/locations",
        json={"name": name},
    )

    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_create_location_slot_assigns_the_next_sort_order(harness: ApiHarness) -> None:
    run = await create_solo_run(harness.client)

    first = await create_location(harness.client, str(run["id"]), "Route 101")
    second = await create_location(harness.client, str(run["id"]), "Oldale Town")

    assert first["name"] == "Route 101"
    assert first["sort_order"] == 1
    assert first["is_custom"] is True
    assert first["encounters"] == []
    assert second["sort_order"] == 2


@pytest.mark.asyncio
async def test_record_caught_encounter_creates_managed_pokemon(harness: ApiHarness) -> None:
    run = await create_solo_run(harness.client)
    location = await create_location(harness.client, str(run["id"]))

    response = await harness.client.post(
        f"/api/v1/runs/{run['id']}/encounters",
        json={
            "encounter_status": "caught",
            "is_shiny": True,
            "location_slot_id": location["id"],
            "nickname": "Zip",
            "species_ref": "zigzagoon",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["warnings"] == []
    assert body["encounter"]["species_ref"] == "zigzagoon"
    assert body["encounter"]["nickname"] == "Zip"
    assert body["encounter"]["is_shiny"] is True
    assert body["pokemon"] is not None
    assert body["pokemon"]["species_ref"] == "zigzagoon"
    assert body["pokemon"]["nickname"] == "Zip"
    assert body["pokemon"]["roster_status"] == "box"
    assert body["pokemon"]["life_status"] == "alive"

    async with harness.session_factory() as session:
        pokemon = await session.scalar(
            select(Pokemon).where(Pokemon.encounter_id == body["encounter"]["id"]),
        )

    assert pokemon is not None
    assert pokemon.run_id == run["id"]


@pytest.mark.asyncio
async def test_record_failed_encounter_does_not_create_pokemon(harness: ApiHarness) -> None:
    run = await create_solo_run(harness.client)
    location = await create_location(harness.client, str(run["id"]))

    response = await harness.client.post(
        f"/api/v1/runs/{run['id']}/encounters",
        json={
            "encounter_status": "failed",
            "location_slot_id": location["id"],
            "species_ref": "poochyena",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["encounter"]["is_shiny"] is False
    assert body["pokemon"] is None


@pytest.mark.asyncio
async def test_duplicate_caught_encounter_returns_soft_warning(harness: ApiHarness) -> None:
    run = await create_solo_run(harness.client)
    location = await create_location(harness.client, str(run["id"]))

    first_response = await harness.client.post(
        f"/api/v1/runs/{run['id']}/encounters",
        json={
            "encounter_status": "caught",
            "location_slot_id": location["id"],
            "species_ref": "zigzagoon",
        },
    )
    assert first_response.status_code == 201

    response = await harness.client.post(
        f"/api/v1/runs/{run['id']}/encounters",
        json={
            "encounter_status": "caught",
            "location_slot_id": location["id"],
            "species_ref": "wurmple",
        },
    )

    assert response.status_code == 201
    assert response.json()["warnings"] == [
        {
            "code": "duplicate_caught_encounter",
            "message": "This location already has a caught encounter for this player.",
            "severity": "warning",
        },
    ]
    assert response.json()["pokemon"]["species_ref"] == "wurmple"


@pytest.mark.asyncio
async def test_caught_encounter_requires_species(harness: ApiHarness) -> None:
    run = await create_solo_run(harness.client)
    location = await create_location(harness.client, str(run["id"]))

    response = await harness.client.post(
        f"/api/v1/runs/{run['id']}/encounters",
        json={
            "encounter_status": "caught",
            "location_slot_id": location["id"],
        },
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_soullink_encounter_requires_room_member(harness: ApiHarness) -> None:
    run = await create_soullink_run(harness.client)
    location = await create_location(harness.client, str(run["id"]))

    response = await harness.client.post(
        f"/api/v1/runs/{run['id']}/encounters",
        json={
            "encounter_status": "caught",
            "location_slot_id": location["id"],
            "species_ref": "sentret",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "member_id is required for Soullink encounters"


@pytest.mark.asyncio
async def test_run_tracker_returns_locations_with_encounters_and_pokemon(
    harness: ApiHarness,
) -> None:
    run = await create_solo_run(harness.client)
    location = await create_location(harness.client, str(run["id"]))
    encounter_response = await harness.client.post(
        f"/api/v1/runs/{run['id']}/encounters",
        json={
            "encounter_status": "caught",
            "location_slot_id": location["id"],
            "nickname": "Zip",
            "species_ref": "zigzagoon",
        },
    )
    assert encounter_response.status_code == 201

    response = await harness.client.get(f"/api/v1/runs/{run['id']}/tracker")

    assert response.status_code == 200
    body = response.json()
    assert body["run"]["id"] == run["id"]
    assert body["room"] is None
    assert body["locations"][0]["id"] == location["id"]
    assert body["locations"][0]["encounters"][0]["species_ref"] == "zigzagoon"
    assert body["locations"][0]["encounters"][0]["is_shiny"] is False
    assert body["locations"][0]["encounters"][0]["pokemon"]["nickname"] == "Zip"


@pytest.mark.asyncio
async def test_soullink_tracker_returns_room_members(harness: ApiHarness) -> None:
    run = await create_soullink_run(harness.client)

    response = await harness.client.get(f"/api/v1/runs/{run['id']}/tracker")

    assert response.status_code == 200
    body = response.json()
    assert body["room"]["id"] == run["room_id"]
    assert body["room"]["members"][0]["display_name"] == "Spieler 1"
