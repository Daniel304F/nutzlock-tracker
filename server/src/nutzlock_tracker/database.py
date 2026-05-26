from collections.abc import AsyncIterator
from importlib import import_module

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from nutzlock_tracker.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, pool_pre_ping=True)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    import_module("nutzlock_tracker.encounters.models")
    import_module("nutzlock_tracker.pokemon.models")
    import_module("nutzlock_tracker.rooms.models")
    import_module("nutzlock_tracker.runs.models")
    import_module("nutzlock_tracker.rules.models")

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionFactory() as session:
        yield session
