# AI Agent Setup

This project is initialized so coding agents can start with project-specific instructions instead of generic framework guesses.

## Installed Project Skills

The following skills are installed project-locally through the `skills` CLI:

```shell
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices --agent '*' -y
npx skills add Dammyjay93/interface-design --skill interface-design --agent '*' -y
```

Installed files:

- `.agents/skills/vercel-react-best-practices/`
- `.agents/skills/interface-design/`
- `skills-lock.json`

To verify:

```shell
npx skills list --json
```

To restore skills from the lockfile in a fresh checkout:

```shell
npx skills experimental_install
```

## External Inputs Used

- `Dammyjay93/interface-design`: installed as `interface-design` and paired with local UI memory in `.interface-design/system.md`.
- Vercel React best-practices: installed as `vercel-react-best-practices`.
- `zhanymkanov/fastapi-best-practices`: not installable through `npx skills add` because the repository does not expose a valid `SKILL.md`; its `AGENTS.md` guidance is captured in `server/AGENTS.md` and `server/docs/BACKEND_GUIDELINES.md`.

The local files summarize backend guidance and project-specific constraints. The installed frontend/interface skills are kept in `.agents/skills/`.

## Local Agent Files

- `AGENTS.md`: shared product and repo rules.
- `client/AGENTS.md`: React 19, Vite, Tailwind, and UI implementation rules.
- `server/AGENTS.md`: FastAPI, uv, SQLite, async database, and testing rules.
- `.github/copilot-instructions.md`: short bridge for GitHub Copilot.
- `.interface-design/system.md`: persistent interface design choices.
- `.agents/skills/`: project-local external skills for compatible agents.

## Working Agreement

- Requirements live in `docs/Anforderungsbogen_Nuzlocke_Soullink_Tracker (1).md`.
- Backend is the source of truth for shared Soullink state.
- No `requirements.txt`; use `server/pyproject.toml` and `uv.lock`.
- UI work should update `.interface-design/system.md` when a reusable pattern becomes established.
- New domain modules should be added by feature, not by technical layer.
