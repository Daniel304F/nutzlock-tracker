# Nutzlock Tracker

Browser-based Nuzlocke and Soullink tracker.

The first project phase is intentionally focused on agent-friendly structure:

- `AGENTS.md` gives AI coding agents the shared project rules.
- `docs/ENTITIES.md` gives agents the canonical domain entity reference.
- `docs/WIREFRAMES.md` and `docs/wireframes.pdf` give agents the layout and workflow reference.
- `client/AGENTS.md` adds React 19 + Tailwind 3 rules.
- `server/AGENTS.md` adds FastAPI + uv + SQLite rules.
- `.agents/skills/` contains installed external project skills.
- `.interface-design/system.md` stores reusable UI decisions.
- `docs/AI_AGENT_SETUP.md` documents the external inspirations and local choices.

## Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS 3
- Backend: FastAPI, Python 3.12, uv, SQLite
- Realtime target: WebSockets or SSE in a later step

## Frontend

```shell
cd client
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Backend

Install uv first if it is not available:

```shell
python -m pip install --user uv
```

Then run the API:

```shell
cd server
python -m uv sync
python -m uv run uvicorn nutzlock_tracker.main:app --reload
```

Default API docs: `http://localhost:8000/api/v1/docs`

## Verification

```shell
cd client
npm run test
npm run build

cd ../server
python -m uv run ruff check
python -m uv run pytest
```

## Development Workflow

- Work test-driven: add or update the smallest meaningful unit test before implementing behavior.
- Implement one feature at a time and verify it before starting the next.
- A feature is not complete until the relevant frontend and/or backend tests pass.
- Keep reusable components and functions as small as possible and as large as necessary.

## Agent Skills

Installed project skills can be checked with:

```shell
npx skills list --json
```

Fresh checkout restore:

```shell
npx skills experimental_install
```
