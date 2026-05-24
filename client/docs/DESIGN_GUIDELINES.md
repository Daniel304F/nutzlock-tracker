# Design Guidelines

## Product Feel

This is a play-session tool, not a brochure. The first screen should help the player manage runs, rooms, encounters, teams, and warnings.

The interface should be:

- quick to scan while playing,
- comfortable on a phone next to a TV or monitor,
- calm enough for repeated edits,
- explicit when a rule warning or death propagation matters.

## Layout

- Prefer app shell layouts, dense lists, segmented controls, and clear action bars.
- Avoid oversized hero sections.
- Avoid decorative backgrounds that compete with sprites and status colors.
- On mobile, stack Soullink partners while keeping the shared route/link obvious.
- Keep all fixed-format controls dimensionally stable.

## Components

- Buttons: icon plus label for important commands, icon-only only for familiar repeated tools with tooltips.
- Toggles: clauses, randomizer mode, room sharing, read-only link.
- Inputs: level, nickname, seed, route name.
- Combobox/search: species, edition, location.
- Dialogs: destructive actions such as deleting a run or marking a death.
- Tabs: Team, Box, Graveyard, Encounters, Rules.

## Status Language

- Alive/team: active, available, legal.
- Box: available but not in party.
- Dead/graveyard: locked, archived, never reusable.
- Incomplete link: visible warning, not a death.
- Rule issue: warning first, block only when the requirements explicitly demand it.

## Visual System

Use `.interface-design/system.md` as the source of reusable spacing, radius, color-role, and status decisions.

Update that file when a new reusable pattern is established.

## Styling Stack

- Tailwind CSS v4 (CSS-first configuration via `@theme` blocks in [src/index.css](../src/index.css)). There is no `tailwind.config.cjs`; tokens live in CSS custom properties.
- The Vite plugin `@tailwindcss/vite` compiles utilities; PostCSS is no longer used.
- shadcn/ui (style: `new-york`, base color: `zinc`) is the component library. Project config: [components.json](../../client/components.json).
- Color, radius, and dark-mode tokens are defined as OKLCH custom properties in `:root` / `.dark` and bridged into Tailwind via `@theme inline`.
- The `cn()` helper in [src/lib/utils.ts](../src/lib/utils.ts) merges class names through `clsx` + `tailwind-merge`. Use it whenever a component composes conditional classes.

## Component Conventions

- Generated shadcn primitives live in `src/components/ui/`. Treat them as project code: edit them when the tracker needs different variants instead of wrapping them in additional abstractions.
- Compose feature components (`src/pages/...`, `src/layout/...`) out of shadcn primitives where one exists. Add a new primitive via `npx shadcn@latest add <component>` before hand-rolling.
- Status-bearing primitives (Button, Badge, Alert, Dialog) must keep the project's semantic color mapping: emerald primary, sky for room/link, amber for warnings, rose for death, violet for box. Override variants in the shadcn component file rather than at the call site.

