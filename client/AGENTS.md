# Frontend Agent Guide

This is a React 19 + Vite + TypeScript + Tailwind 3 app.

Also read:

- Root `AGENTS.md`
- `docs/ENTITIES.md`
- `docs/WIREFRAMES.md`
- `docs/wireframes.pdf`
- `.agents/skills/vercel-react-best-practices/SKILL.md`
- `.agents/skills/interface-design/SKILL.md`
- `.interface-design/system.md`
- `client/docs/DESIGN_GUIDELINES.md`

## Installed Skills

- Use `vercel-react-best-practices` from `.agents/skills/vercel-react-best-practices/` when writing, reviewing, or refactoring React code.
- Use `interface-design` from `.agents/skills/interface-design/` when building or reviewing app UI.

## React Rules

- Use test-driven development for behavior changes: add or update a Vitest unit test before implementation, then make it pass.
- Keep control flow flat with guard clauses and early returns.
- Keep functions and hooks short, precise, and single-purpose.
- Remove duplicated component logic once the same behavior repeats.
- Keep async work parallel when operations are independent.
- Do not create request waterfalls in loaders, effects, or API helpers.
- Calculate cheap derived values during render instead of storing duplicate state.
- Put interaction logic in event handlers; avoid effects for things that are not synchronization.
- Use functional state updates when next state depends on previous state.
- Avoid defining components inside components.
- Avoid broad barrel imports in new code when direct imports are practical and typed.
- Add Suspense or route-level loading only when it improves perceived responsiveness.

## UI Rules

- Build the app experience directly. Do not add a marketing landing page.
- Use `docs/wireframes.pdf` as the layout and flow reference for page-level UI.
- Keep components reusable, as small as possible and as large as necessary.
- Mobile browser workflows must be complete and touch-friendly.
- Use status labels/icons in addition to color.
- Keep repeated-item cards at 8px radius or less.
- Do not nest cards inside cards.
- Do not add decorative gradient blobs/orbs.
- Keep text fitting inside controls on mobile and desktop.

## Project Patterns

- `src/api`: typed API modules and the shared Axios client.
- `src/contexts`: React context providers.
- `src/hooks`: reusable React hooks.
- `src/layout`: app shell and layout components.
- `src/lib`: cross-cutting infrastructure helpers.
- `src/pages`: route/page-level components.
- `src/utils`: framework-light utilities.
- `src/assets`: static assets imported by the app.
- Shared UI components should go in `src/components`.
- Feature code should be grouped by feature once it grows beyond a single file.
- Keep environment-specific API URLs in `.env` via `VITE_API_URL`.
- Use path aliases such as `@api/health` and `@layout/AppShell` instead of long relative imports.
- Keep component tests next to the source as `*.test.tsx`; keep pure TypeScript tests as `*.test.ts`.
- Test API modules by mocking the shared client or adapter, not by calling a live server.
- Add a test for each new hook, utility, domain function, and non-trivial component behavior.

## Commands

```shell
npm install
npm run dev
npm run test
npm run build
```
