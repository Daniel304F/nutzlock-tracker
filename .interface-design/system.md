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

Overlays:

- Use the global `ModalProvider` for app-wide dialogs instead of local modal state when a flow needs confirmation from multiple features.
- Dialogs use Radix Dialog, an understated zinc overlay, 8px radius, a white elevated surface, border separation, and a compact title/description header.
- Destructive or irreversible actions, especially death, delete, archive, and propagation-related actions, should use the modal service `confirm` flow.
- Primary modal actions map to semantic intent: emerald for default, amber for warning, rose for danger/death.
- Mobile dialogs must fit within `100dvh`, keep actions reachable at the bottom, and stack actions vertically when space is narrow.

Toasts:

- Use the global `ToastProvider` and typed toast service for transient feedback after saves, sync events, imports, API errors, and rule warnings.
- Toasts appear top-right on desktop and use semantic borders/colors: emerald success, sky info, amber warning, rose error.
- Toast copy should be short and action-oriented, with optional description for context. Do not use toasts for decisions that require user confirmation.
- Default duration is brief enough for play-session rhythm; persistent or destructive choices belong in a modal.
