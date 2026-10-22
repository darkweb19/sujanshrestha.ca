# Claude Code entrypoint

Read `AGENTS.md` and `docs/portfolio-redesign-brief.md` first. They are the canonical design, implementation, security and multi-agent delegation contract. **All skill files reside in `.agents/skills/<slug>/SKILL.md`** and must be read there, not copied into `.claude/skills`.

For native project skill auto-discovery, optionally run `node scripts/link-agent-skills.mjs` locally to create `.claude/skills` as a link to the canonical directory. If the environment does not support symlinks, explicitly read the skill files from `.agents/skills`. Use native subagent tools only when available; Luna and Terra are role labels, not assumed model names.

Current commands: `pnpm dev`, `pnpm lint`, `pnpm test` and `pnpm build`. Legacy `DESIGN.md` and `UX-CONTRACT.md` describe the previous browser-only Lab and must be updated with the new SQLite requirement, not allowed to override the user's redesign brief.
