# Repository Copilot instructions

`AGENTS.md` is the single source of truth for architecture, UX, redesign requirements, QA and agent delegation. Read `docs/portfolio-redesign-brief.md` and only the relevant canonical `.agents/skills/<slug>/SKILL.md` content. Do not create divergent files under `.github/skills`. Locally, `node scripts/link-agent-skills.mjs` can create an optional link when the Copilot host supports skill discovery through links. Do not assume tool availability, agent names or native discovery; explicitly read files when necessary.
