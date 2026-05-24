# Backend Guidelines

## Package Management

Use uv only:

```shell
python -m uv sync
python -m uv add fastapi
python -m uv add --dev pytest
```

Do not create `requirements.txt`.

## API Shape

- Prefix v1 routes with `/api/v1`.
- Keep health/system endpoints separate from domain endpoints.
- Use Pydantic response models.
- Use explicit tags for OpenAPI grouping.
- Keep route handlers orchestration-only.

## Domain Rules

The backend owns these behaviors:

- room creation and membership,
- join-code validation,
- optional room password hash and reset token lifecycle,
- run persistence,
- JSON export/import validation,
- encounter uniqueness warnings,
- level-cap and team-sync warnings,
- Soullink link creation,
- death propagation.

## Persistence Rules

SQLite is enough for v1, but code should not make global mutable assumptions that would block a later database change.

Use async SQLAlchemy sessions and keep transaction boundaries in service functions where shared state changes happen.

