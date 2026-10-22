# Canonical multi-harness agent home

`AGENTS.md` at repository root is the canonical operating contract. All actual skills live under `.agents/skills/<slug>/SKILL.md`, checked in once with supporting references, assets and scripts. Read `.agents/skills/README.md` for sources and routing.

**Codex:** native `AGENTS.md` + `.agents/skills` discovery.  
**Claude Code:** root `CLAUDE.md` forwards instructions to `AGENTS.md` and shared skills; optional local symlink `.claude/skills` is created by `node scripts/link-agent-skills.mjs` for native discovery.  
**Cursor:** `.cursor/rules/portfolio.mdc` forwards to `AGENTS.md`; optional `.cursor/skills` local symlink.  
**GitHub Copilot:** `.github/copilot-instructions.md` forwards to `AGENTS.md`; optional `.github/skills` link where supported.  
**Gemini CLI:** `GEMINI.md` forwards to `AGENTS.md`; optional `.gemini/skills` link.

Different products discover skills differently. A pointer ensures readable instructions, not necessarily slash-command/native skill discovery. In Web/cloud environments where setup scripts do not run, ask the harness to read the canonical `SKILL.md` files explicitly. Never keep drift-prone copied skills in per-harness directories.
