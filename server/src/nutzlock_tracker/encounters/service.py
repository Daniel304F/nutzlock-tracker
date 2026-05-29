from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from nutzlock_tracker.encounters.models import Encounter, LocationSlot
from nutzlock_tracker.encounters.schemas import (
    EncounterCreate,
    EncounterRecordResponse,
    EncounterResponse,
    EncounterStatus,
    EncounterWithPokemonResponse,
    LocationSlotCreate,
    LocationSlotResponse,
    RuleWarningResponse,
    RunTrackerResponse,
)
from nutzlock_tracker.model_utils import utc_timestamp
from nutzlock_tracker.pokemon.models import Pokemon
from nutzlock_tracker.pokemon.schemas import PokemonResponse
from nutzlock_tracker.rooms.models import Member, Room
from nutzlock_tracker.rooms.service import build_room_response
from nutzlock_tracker.runs.models import Run
from nutzlock_tracker.runs.schemas import ChallengeMode, RunResponse
from nutzlock_tracker.runs.service import get_run

DUPLICATE_CAUGHT_WARNING = RuleWarningResponse(
    code="duplicate_caught_encounter",
    message="This location already has a caught encounter for this player.",
)


async def create_location_slot(
    session: AsyncSession,
    run_id: str,
    payload: LocationSlotCreate,
) -> LocationSlotResponse:
    run = await get_run(session, run_id)
    sort_order = payload.sort_order or await get_next_location_sort_order(session, run.id)
    location = LocationSlot(
        game_version_ref=payload.game_version_ref or run.game_version_ref,
        is_custom=True,
        name=payload.name,
        reference_location_ref=payload.reference_location_ref,
        run_id=run.id,
        sort_order=sort_order,
    )

    session.add(location)
    await session.commit()
    await session.refresh(location)
    return build_location_response(location=location, encounters=[])


async def get_next_location_sort_order(session: AsyncSession, run_id: str) -> int:
    max_sort_order = await session.scalar(
        select(func.max(LocationSlot.sort_order)).where(LocationSlot.run_id == run_id),
    )
    return (max_sort_order or 0) + 1


async def record_encounter(
    session: AsyncSession,
    run_id: str,
    payload: EncounterCreate,
) -> EncounterRecordResponse:
    run = await get_run(session, run_id)
    location = await get_location_for_run(session, run.id, payload.location_slot_id)
    await validate_member_scope(session, run, payload.member_id)

    warnings = await build_encounter_warnings(session, run.id, payload)
    encounter = Encounter(
        ability=payload.ability,
        encounter_status=payload.encounter_status.value,
        gender=payload.gender.value if payload.gender else None,
        is_shiny=payload.is_shiny,
        level=payload.level,
        location_slot_id=location.id,
        member_id=payload.member_id,
        nature=payload.nature,
        nickname=payload.nickname,
        notes=payload.notes,
        run_id=run.id,
        species_ref=payload.species_ref,
    )
    session.add(encounter)
    await session.flush()

    pokemon = (
        build_pokemon_for_encounter(run.id, encounter)
        if should_create_pokemon(payload)
        else None
    )

    if pokemon:
        session.add(pokemon)

    location.updated_at = utc_timestamp()
    await session.commit()
    await session.refresh(encounter)

    if pokemon:
        await session.refresh(pokemon)

    return EncounterRecordResponse(
        encounter=EncounterResponse.model_validate(encounter),
        pokemon=PokemonResponse.model_validate(pokemon) if pokemon else None,
        warnings=warnings,
    )


async def get_run_tracker(session: AsyncSession, run_id: str) -> RunTrackerResponse:
    run = await get_run(session, run_id)
    locations = await list_location_responses(session, run.id)
    room = await session.get(Room, run.room_id) if run.room_id else None
    room_response = await build_room_response(session, room) if room else None
    return RunTrackerResponse(
        locations=locations,
        room=room_response,
        run=RunResponse.model_validate(run),
    )


async def get_location_for_run(
    session: AsyncSession,
    run_id: str,
    location_slot_id: str,
) -> LocationSlot:
    location = await session.get(LocationSlot, location_slot_id)

    if location is None or location.run_id != run_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location slot not found",
        )

    return location


async def validate_member_scope(
    session: AsyncSession,
    run: Run,
    member_id: str | None,
) -> None:
    if run.challenge_mode != ChallengeMode.soullink.value:
        return

    if not member_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="member_id is required for Soullink encounters",
        )

    member = await session.get(Member, member_id)

    if member is None or member.room_id != run.room_id or member.role == "viewer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="member_id must reference a writable room member",
        )


async def build_encounter_warnings(
    session: AsyncSession,
    run_id: str,
    payload: EncounterCreate,
) -> list[RuleWarningResponse]:
    if payload.encounter_status != EncounterStatus.caught:
        return []

    filters = [
        Encounter.run_id == run_id,
        Encounter.location_slot_id == payload.location_slot_id,
        Encounter.encounter_status == EncounterStatus.caught.value,
    ]

    if payload.member_id is None:
        filters.append(Encounter.member_id.is_(None))
    else:
        filters.append(Encounter.member_id == payload.member_id)

    existing_encounter = await session.scalar(select(Encounter.id).where(*filters).limit(1))

    if existing_encounter is None:
        return []

    return [DUPLICATE_CAUGHT_WARNING]


def should_create_pokemon(payload: EncounterCreate) -> bool:
    return payload.encounter_status == EncounterStatus.caught and payload.species_ref is not None


def build_pokemon_for_encounter(run_id: str, encounter: Encounter) -> Pokemon:
    return Pokemon(
        current_level=encounter.level,
        encounter_id=encounter.id,
        life_status="alive",
        nickname=encounter.nickname,
        owner_member_id=encounter.member_id,
        roster_status="box",
        run_id=run_id,
        species_ref=encounter.species_ref or "",
    )


async def list_location_responses(session: AsyncSession, run_id: str) -> list[LocationSlotResponse]:
    location_result = await session.scalars(
        select(LocationSlot)
        .where(LocationSlot.run_id == run_id)
        .order_by(LocationSlot.sort_order.asc(), LocationSlot.created_at.asc()),
    )
    locations = list(location_result)

    if not locations:
        return []

    encounter_result = await session.scalars(
        select(Encounter)
        .where(Encounter.run_id == run_id)
        .order_by(Encounter.created_at.asc()),
    )
    encounters = list(encounter_result)
    pokemon_result = await session.scalars(select(Pokemon).where(Pokemon.run_id == run_id))
    pokemon_by_encounter_id = {
        pokemon.encounter_id: pokemon for pokemon in pokemon_result
    }

    encounters_by_location_id: dict[str, list[EncounterWithPokemonResponse]] = {
        location.id: [] for location in locations
    }

    for encounter in encounters:
        pokemon = pokemon_by_encounter_id.get(encounter.id)
        encounter_data = EncounterResponse.model_validate(encounter).model_dump()
        encounters_by_location_id[encounter.location_slot_id].append(
            EncounterWithPokemonResponse(
                **encounter_data,
                pokemon=PokemonResponse.model_validate(pokemon) if pokemon else None,
            ),
        )

    return [
        build_location_response(
            location=location,
            encounters=encounters_by_location_id[location.id],
        )
        for location in locations
    ]


def build_location_response(
    location: LocationSlot,
    encounters: list[EncounterWithPokemonResponse],
) -> LocationSlotResponse:
    location_data = LocationSlotResponse.model_validate(location).model_dump(
        exclude={"encounters"},
    )
    return LocationSlotResponse(**location_data, encounters=encounters)
