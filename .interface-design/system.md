# Interface Design System

## Direction

Personality: focused companion tool for active play sessions.

Foundation: utility and clarity with a little adventure-table flavor. The UI should feel practical beside a game screen: quick to scan, touch-friendly, and calm under repeated use.

Best for: tracker dashboards, encounter entry, room state, roster management, graveyard history, and rule warnings.

## Tokens

Spacing base: 4px

Scale: 4, 8, 12, 16, 20, 24, 32, 40

Radius:

- Controls: 6px
- Cards and repeated items: 8px
- Dialogs: 8px

Typography:

- Body: system sans-serif
- Letter spacing: 0
- Dense panels should use compact headings, not hero-scale text.

Color roles:

- Page: warm white / neutral zinc
- Text: zinc-950
- Muted text: zinc-600
- Primary action: emerald
- Link/room accent: sky
- Warning: amber
- Danger/death: rose
- Box/bench: violet

Avoid a one-hue UI. Status colors must be paired with icons or labels, not color alone.

## Patterns

Wireframes:

- Use `docs/wireframes.pdf` as the source for page flow, layout shape, and mobile/desktop relationships.
- Use `docs/WIREFRAMES.md` for the page map and implementation notes.
- Treat wireframes as hierarchy and workflow guidance, not pixel-perfect styling.

App shell:

- Top-level app experience first, not a marketing landing page.
- Primary navigation should remain predictable on desktop and mobile.
- Do not hide core actions behind hover-only affordances.

Cards:

- Use cards only for repeated items, concise panels, modals, or framed tools.
- Do not nest cards inside cards.
- Radius max 8px unless a future design system changes it.

Forms:

- Encounter entry should fit mobile thumbs.
- Use combobox/search for species selection.
- Use toggles for clauses and randomizer flags.
- Use confirmation dialogs for death actions.

Tables/lists:

- Prefer responsive lists over horizontal scrolling on phones.
- Soullink pairs can stack on mobile, but the link relationship must remain visually obvious.

Status treatment:

- Alive/team: emerald mark plus text.
- Box: violet mark plus text.
- Death/graveyard: rose mark plus text.
- Rule warning: amber mark plus direct explanation.
