# Copilot Instructions

Follow the root `AGENTS.md` and the closest nested `AGENTS.md`.

Key project constraints:

- React 19 + Vite + Tailwind 3 in `client/`.
- FastAPI + SQLite in `server/`.
- Backend dependency management uses uv only. Do not create `requirements.txt`.
- Use server-side transactions for shared Soullink effects such as death propagation.
- Preserve mobile-first usability for every core workflow.
- Read `docs/ENTITIES.md` before changing domain models, API schemas, or UI state shape.
- Read `docs/WIREFRAMES.md` and inspect `docs/wireframes.pdf` before page-level UI or layout work.
- Work test-driven, one feature at a time, with short functions, flat control flow, and no duplicated business logic.
