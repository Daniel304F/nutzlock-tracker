from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from nutzlock_tracker.config import get_settings
from nutzlock_tracker.database import init_db
from nutzlock_tracker.encounters.router import router as encounters_router
from nutzlock_tracker.health.router import router as health_router
from nutzlock_tracker.rooms.router import router as rooms_router
from nutzlock_tracker.runs.router import router as runs_router


def _ensure_sqlite_parent(database_url: str) -> None:
    sqlite_prefix = "sqlite+aiosqlite:///"

    if not database_url.startswith(sqlite_prefix):
        return

    database_path = database_url.removeprefix(sqlite_prefix)

    if database_path == ":memory:":
        return

    Path(database_path).parent.mkdir(parents=True, exist_ok=True)


def build_lifespan(init_database: bool = True):
    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        settings = get_settings()
        _ensure_sqlite_parent(settings.database_url)

        if init_database:
            await init_db()

        yield

    return lifespan


def create_app(init_database: bool = True) -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url=f"{settings.api_v1_prefix}/docs",
        redoc_url=f"{settings.api_v1_prefix}/redoc",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        lifespan=build_lifespan(init_database),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix=settings.api_v1_prefix)
    app.include_router(encounters_router, prefix=settings.api_v1_prefix)
    app.include_router(rooms_router, prefix=settings.api_v1_prefix)
    app.include_router(runs_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
