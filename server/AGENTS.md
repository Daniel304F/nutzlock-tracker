# Backend Agent Guide

This backend is FastAPI with uv-managed dependencies and SQLite persistence.

Do not add `requirements.txt`. Use `pyproject.toml` and `uv.lock`.

Read `../docs/ENTITIES.md` before adding or changing models, schemas, migrations, service payloads, or import/export shape.

## Structure

Use domain packages under `src/nutzlock_tracker/`:

```text
src/nutzlock_tracker/
  {domain}/
    router.py
    schemas.py
    models.py
    service.py
    dependencies.py
    constants.py
    exceptions.py
  config.py
  database.py
  main.py
```

Small domains do not need every file immediately, but keep the shape predictable as they grow.

## FastAPI Rules

- Use `async def` for non-blocking I/O.
- Never call blocking libraries such as `requests` or sync SQLAlchemy sessions inside `async def`.
- If a sync library is unavoidable, wrap it with `fastapi.concurrency.run_in_threadpool`.
- Use `Annotated[T, Depends(...)]` for dependencies.
- Keep route handlers thin; put domain behavior in services.
- Keep service functions short and single-purpose.
- Keep control flow flat with guard clauses and early returns.
- Remove duplicated business logic by extracting named helpers or services.
- Document endpoints with response models, summaries, tags, and meaningful status codes.

## Database Rules

- Use SQLAlchemy 2.0 async APIs.
- Use SQLite for v1, via `sqlite+aiosqlite`.
- Shared effects such as Soullink death propagation must be one server-side transaction.
- Keep ORM models and Pydantic schemas separate.
- Table and column names use lower-case snake case.

## Testing

- Use test-driven development for behavior changes: add or update the smallest failing test first, implement, then run tests.
- Use `pytest`, `pytest-asyncio`, and `httpx.AsyncClient` with `ASGITransport`.
- Prefer dependency overrides over monkeypatching internals.
- Add integration tests for API behavior and domain tests for rule propagation.
- Implement at most one backend feature at a time.
- Keep services/functions focused and reusable as small as possible and as large as necessary.
- Do not mark backend work complete until `python -m uv run ruff check` and `python -m uv run pytest` pass.

## Commands

```shell
python -m uv sync
python -m uv run ruff check
python -m uv run pytest
python -m uv run uvicorn nutzlock_tracker.main:app --reload
```
