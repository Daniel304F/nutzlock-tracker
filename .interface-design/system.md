# Interface Design System

## Direction

Personality: focused companion tool for active play sessions with a sharper gaming-console edge.

Foundation: utility and clarity with Hibiscus Aura energy and Urban Nocturne contrast. The UI should feel practical beside a game screen: quick to scan, touch-friendly, vivid enough to feel alive, and calm enough for repeated use.

Best for: tracker dashboards, encounter entry, room state, roster management, graveyard history, and rule warnings.

## Tokens

Tokens are declared as CSS custom properties in `client/src/index.css` and exposed to Tailwind v4 utilities through the `@theme` / `@theme inline` blocks. There is no `tailwind.config.cjs` — adding a token means adding a CSS variable, not editing a JS config.

Spacing base: 4px

Scale: 4, 8, 12, 16, 20, 24, 32, 40

Radius:

- Source token: `--radius` (0.5rem). Derived `--radius-sm/md/lg/xl` are exposed via `@theme inline`.
- Controls: 6px (`rounded-md`)
- Cards and repeated items: 8px (`rounded-lg`)
- Dialogs: 8px (`rounded-lg`)

Typography:

- Body: `--font-sans` (Inter + system fallback stack), reachable via `font-sans`.
- Letter spacing: 0
- Dense panels should use compact headings, not hero-scale text.

Color roles (semantic shadcn tokens, generated from supplied palettes):

- Page background: `bg-background` (`#f7f7f5` in light, Urban Nocturne `#141414` in dark)
- Text: `text-foreground`
- Muted text: `text-muted-foreground`
- Surfaces: `bg-card`, `bg-popover`
- Primary action: `bg-primary` / `text-primary-foreground` (Hibiscus indigo `#5848B3` in light, neon `#E2E800` in dark)
- Borders & focus rings: `border-border`, `ring-ring`
- Destructive / death: `bg-destructive` / `text-destructive-foreground` (ruby `#DD3027`)

Palette utilities exposed through Tailwind tokens:

- Hibiscus: `bg-hibiscus` / `text-hibiscus` (`#EA44D4`)
- Ruby: `bg-ruby` / `text-ruby` (`#DD3027`)
- Aura purple: `bg-aura` / `text-aura` (`#733D6F`)
- Indigo: `bg-indigo` / `text-indigo` (`#5848B3`)
- Urban neutrals: `bg-nocturne`, `bg-charcoal`, `bg-mist`, `bg-steel`
- Warning / high-energy signal: `bg-neon` / `text-neon` (`#E2E800`)

Avoid a one-hue UI. Status colors must be paired with icons or labels, not color alone.

## Patterns

App shell:

- Top-level app experience first, not a marketing landing page.
- Use the palette rail and compact brand tile as the product signature.
- Primary navigation should remain predictable on desktop and mobile.
- Do not hide core actions behind hover-only affordances.
- Keep the theme toggle visible in the global header.
- Keep a compact footer in the global shell with brand continuity and restrained stack/status badges.

Home workspace:

- Use a compact command-center hero, not a marketing hero.
- Keep the run creation form prominent and sticky on wide screens.
- On mobile, stack hero, actions, recent runs, and setup without horizontal scrolling.
- Preserve the run creation API object shape when restyling the form.

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

- Alive/team: neon or primary mark plus text.
- Box: violet mark plus text.
- Death/graveyard: ruby mark plus text.
- Rule warning: neon mark plus direct explanation.

Overlays:

- Use the global `ModalProvider` for app-wide dialogs instead of local modal state when a flow needs confirmation from multiple features.
- Dialogs build on the shadcn `Dialog` primitive (Radix under the hood), an understated zinc overlay, 8px radius, a white elevated surface, border separation, and a compact title/description header.
- Destructive or irreversible actions, especially death, delete, archive, and propagation-related actions, should use the modal service `confirm` flow.
- Primary modal actions map to semantic intent: emerald for default, amber for warning, rose for danger/death.
- Mobile dialogs must fit within `100dvh`, keep actions reachable at the bottom, and stack actions vertically when space is narrow.

## Component Library

- shadcn/ui (style: `new-york`, base color: `zinc`) is the source for primitives. Config: `client/components.json`.
- Generated primitives live in `client/src/components/ui/`. They are project code and may be edited rather than wrapped in extra abstractions.
- Add new primitives from inside `client/` with `npx shadcn@latest add <component>` (e.g. `button`, `dialog`, `select`, `tooltip`).
- Compose class names via the `cn()` helper in `client/src/lib/utils.ts` (clsx + tailwind-merge).

Toasts:

- Use the global `ToastProvider` and typed toast service for transient feedback after saves, sync events, imports, API errors, and rule warnings.
- Toasts appear top-right on desktop and use semantic borders/colors: emerald success, sky info, amber warning, rose error.
- Toast copy should be short and action-oriented, with optional description for context. Do not use toasts for decisions that require user confirmation.
- Default duration is brief enough for play-session rhythm; persistent or destructive choices belong in a modal.
