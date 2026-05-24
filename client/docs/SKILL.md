# UI Implementation Skill

Use this project-local skill when building or changing the tracker UI.

## Before Editing

1. Read `.interface-design/system.md`.
2. Read `client/docs/DESIGN_GUIDELINES.md`.
3. Identify the workflow: run setup, room join, encounter entry, roster move, death confirmation, rules, import/export, or reference-data browsing.

## Implementation Checklist

- Keep the first screen useful as an app surface.
- Make the mobile version complete, not read-only.
- Show status through label/icon plus color.
- Keep action targets large enough for touch.
- Avoid card nesting.
- Keep reusable patterns consistent with `.interface-design/system.md`.
- Prefer small typed components over large untyped JSX blocks.

## Acceptance Check

Before finishing UI work:

- Check desktop and mobile layouts.
- Check long German labels and Pokemon names.
- Check empty, loading, success, and error states.
- Check destructive actions have confirmation.

