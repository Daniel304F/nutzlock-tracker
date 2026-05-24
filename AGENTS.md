# Agent Guide

This repository is a React/FastAPI monorepo for a browser-based Nuzlocke and Soullink tracker.

Read these first:

1. `docs/Anforderungsbogen_Nuzlocke_Soullink_Tracker (1).md`
2. `docs/ARCHITECTURE.md`
3. `docs/ENTITIES.md`
4. `docs/WIREFRAMES.md` and `docs/wireframes.pdf` when changing UI or layout
5. `.agents/skills/vercel-react-best-practices/SKILL.md` when changing React code
6. `.agents/skills/interface-design/SKILL.md` when changing UI
7. `.interface-design/system.md`
8. The nearest nested `AGENTS.md`

## Product Priorities

- Mobile browser usage is first-class, not a trimmed-down view.
- Soullink state must be server-authoritative for shared effects such as death propagation.
- Local/offline behavior can help solo runs, but shared rooms require server persistence.
- Rule validation is mostly soft validation: warn clearly, do not over-block house rules.
- The data model must allow n-player links even if v1 UI focuses on two players.

## Repository Layout

- `client/`: React 19 SPA with Tailwind 3.
- `server/`: FastAPI backend managed with uv. Do not add `requirements.txt`.
- `docs/`: project requirements, architecture notes, and agent setup.
- `.interface-design/`: persistent interface design memory for future UI work.

## Agent Workflow

- Work test-driven for functional changes: write or update the smallest failing test first, implement the behavior, then run the relevant test suite.
- Implement at most one feature at a time. If a request contains multiple features, finish and verify one vertical slice before starting the next.
- Do not consider a feature complete until the relevant frontend and/or backend tests pass.
- Read `docs/ENTITIES.md` before adding or changing domain models, API schemas, TypeScript domain types, persistence, or UI state shape.
- Read `docs/WIREFRAMES.md` and inspect `docs/wireframes.pdf` before page-level UI or layout work.
- Keep changes scoped and update the relevant docs when a convention changes.
- Use installed project skills from `.agents/skills/` when their scope matches the task.
- Prefer typed boundaries: TypeScript types in the client, Pydantic schemas in the API.
- Keep domain logic out of UI components and route handlers.
- Add or update tests for shared logic, API behavior, and rule validation.
- Build reusable pieces as small as possible and as large as necessary. Avoid premature abstraction, but extract repeated logic/components once reuse is real.
- Keep control flow flat. Prefer guard clauses, early returns, and small helpers over deeply nested conditionals.
- Keep functions short, precise, and single-purpose. Split mixed responsibilities before they become hard to test.
- Eliminate duplication when behavior repeats. Extract shared logic only when the shared concept is real.
- Make senior-level tradeoffs explicit in code structure: clear names, narrow modules, typed contracts, and minimal side effects.
- Do not introduce authentication accounts unless the requirements change; rooms use anonymous membership.

## Commands

Frontend:

```shell
cd client
npm install
npm run test
npm run build
```

Backend:

```shell
cd server
python -m uv sync
python -m uv run ruff check
python -m uv run pytest
```
