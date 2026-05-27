from collections.abc import AsyncIterator
from importlib import import_module

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from nutzlock_tracker.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, pool_pre_ping=True)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def _ensure_sqlite_columns(connection) -> None:
    if connection.dialect.name != "sqlite":
        return

    inspector = inspect(connection)

    if "encounters" not in inspector.get_table_names():
        return

    encounter_columns = {
        column["name"] for column in inspector.get_columns("encounters")
    }

    if "is_shiny" in encounter_columns:
        return

    connection.execute(
        text("ALTER TABLE encounters ADD COLUMN is_shiny BOOLEAN NOT NULL DEFAULT 0"),
    )


async def init_db() -> None:
    import_module("nutzlock_tracker.encounters.models")
    import_module("nutzlock_tracker.pokemon.models")
    import_module("nutzlock_tracker.rooms.models")
    import_module("nutzlock_tracker.runs.models")
    import_module("nutzlock_tracker.rules.models")

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        await connection.run_sync(_ensure_sqlite_columns)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionFactory() as session:
        yield session
