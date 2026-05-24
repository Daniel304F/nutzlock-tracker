# Wireframes

The visual wireframe source is `docs/wireframes.pdf`.

Metadata:

- Title: `Pokemon soullink nutzlocke tracker`
- Version shown in PDF: `WIREFRAMES V0.1`
- Created: `2026-05-24`
- Pages: `14`
- Intent from the PDF: read for shape and flow, not pixels.

## How Agents Should Use This

- Read this file and inspect `docs/wireframes.pdf` before implementing UI, layout, navigation, or page-level components.
- Treat the wireframes as the layout and workflow reference, not as a pixel-perfect design spec.
- Preserve the flow and information hierarchy unless the product requirements, `docs/ENTITIES.md`, accessibility, or responsive constraints require a better implementation.
- When deviating from the wireframes, make the reason explicit in code review notes or implementation summaries.
- Keep mobile and desktop behavior first-class. The PDF shows mobile and desktop side-by-side for many surfaces.

## Page Map

| PDF page | Surface | Notes |
|---|---|---|
| 1 | Cover / index | Overview of the review set. |
| 2 | Landing & entry point | New run, join room, import JSON, recent runs. |
| 3 | Run setup | Multi-step setup for basics, rules, randomizer, room. |
| 4 | Room setup | UUID, invite code, password, recovery email, members. |
| 5 | Encounter list, solo Nuzlocke | Route list and encounter status scanning. |
| 6 | Mobile encounter dialog | Three mobile entry patterns. |
| 7 | Pair view A | Soullink paired columns. |
| 8 | Pair view B | Soullink linked cards. |
| 9 | Pair view C | Unified Soullink row. |
| 10 | Team / Box / Graveyard | Roster management and status views. |
| 11 | Pokemon detail | Individual Pokemon metadata and actions. |
| 12 | Milestones / level cap / stats / logbook | Progress, cap warnings, statistics, event history. |
| 13 | Settings | Clauses, retroactive changes, randomizer file, house rules. |
| 14 | Read-only stream view | Viewer/OBS surface without write actions. |

## Implementation Notes

- Initial route/page planning should mirror the main surfaces: landing, setup, room, encounters, soullink pairs, roster, Pokemon detail, progress, settings, and stream view.
- Encounter entry must stay fast on mobile and avoid horizontal scrolling.
- Soullink pair views can choose the layout pattern that best fits the current viewport, but must keep the link relationship obvious.
- Settings and clause changes should show history/audit implications.
- Stream views are read-only and should hide write actions entirely.

