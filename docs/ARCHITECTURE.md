# Architecture

## Overview

The app is split into a React SPA and a FastAPI backend.

- Client: renders the tracker, handles local interaction state, and calls the API.
- Server: owns persistence, rule validation, room membership, and shared Soullink effects.
- SQLite: stores the central run state for v1.

## Planned Backend Domains

- `health`: infrastructure checks.
- `runs`: run lifecycle, status, export/import.
- `rooms`: room UUID, join codes, optional password/reset flow, read-only links.
- `encounters`: location slots and encounter entries.
- `pokemon`: roster, box, graveyard, death actions.
- `links`: Soullink group membership and death propagation.
- `rules`: clauses, validation, and rule-change log.
- `references`: PokeAPI cache and sprite metadata.

## Realtime Sync

Realtime sync should be introduced as a server-mediated stream:

- Prefer WebSockets when bidirectional room events are needed.
- SSE is acceptable for server-to-client updates if mutations stay as HTTP requests.
- Clients should not independently propagate death or link state.
- Shared effects should happen in one server-side transaction.

## Persistence

SQLite is the v1 persistence target. The API should keep SQLAlchemy models and Pydantic schemas separate.

JSON export/import is a versioned serialization of the same domain model, not an alternative data model.

## Frontend Boundaries

React components should stay mostly presentational. Put API calls in `src/api`, cross-cutting helpers in `src/lib`, feature rules in feature modules, and reusable UI components in `src/components` once they exist.

## Wireframe Reference

Use `docs/WIREFRAMES.md` and `docs/wireframes.pdf` as the layout and workflow reference for page-level UI. The PDF is a flow and hierarchy guide, not a pixel-perfect design contract.

## Entity Reference

Use `docs/ENTITIES.md` as the canonical domain reference before adding database tables, Pydantic schemas, TypeScript types, or UI state that represents run data.
