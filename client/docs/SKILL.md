# UI Implementation Skill

Use this project-local skill when building or changing the tracker UI.

## Before Editing

1. Read `.interface-design/system.md`.
2. Read `client/docs/DESIGN_GUIDELINES.md`.
3. Identify the workflow: run setup, room join, encounter entry, roster move, death confirmation, rules, import/export, or reference-data browsing.
4. Check `client/src/components/ui/` for an existing shadcn primitive that fits. If one is missing, add it with `npx shadcn@latest add <component>` (run from `client/`).

## Implementation Checklist

- Keep the first screen useful as an app surface.
- Make the mobile version complete, not read-only.
- Show status through label/icon plus color.
- Keep action targets large enough for touch.
- Avoid card nesting.
- Keep reusable patterns consistent with `.interface-design/system.md`.
- Prefer small typed components over large untyped JSX blocks.
- Build feature UI from shadcn primitives in `src/components/ui/`; compose with the `cn()` helper from `@/lib/utils` for conditional class names.
- Use Tailwind v4 utilities backed by the theme tokens in `src/index.css`. Do not reintroduce `tailwind.config.cjs` or PostCSS — token additions belong in the `@theme` blocks.
- For new design tokens, define a CSS custom property in `:root` (and `.dark`) and expose it through the `@theme inline` block so Tailwind generates the matching utility (`bg-*`, `text-*`, `border-*`, `ring-*`).

## Acceptance Check

Before finishing UI work:

- Check desktop and mobile layouts.
- Check long German labels and Pokemon names.
- Check empty, loading, success, and error states.
- Check destructive actions have confirmation.

