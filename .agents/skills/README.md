# Canonical skill library

This directory is the **single checked-in** source for coding-agent skills. Each source skill and all its supporting files are preserved at a pinned upstream revision. `AGENTS.md` defines the main-thread and subagent operating rules.

| Skill | Main purpose | Original source |
| --- | --- | --- |
| [senior-frontend](senior-frontend/SKILL.md) | Senior Next.js, SSR/RSC, frontend architecture | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/senior-frontend) |
| [frontend-design](frontend-design/SKILL.md) | Non-template, distinctive visual direction | [anthropics/skills](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design) |
| [ui-design-system](ui-design-system/SKILL.md) | UI tokens, visual system and responsive components | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/ui-design-system) |
| [ux-researcher-designer](ux-researcher-designer/SKILL.md) | Information architecture, user research and usability | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/ux-researcher-designer) |
| [a11y-audit](a11y-audit/SKILL.md) | WCAG 2.2 AA, semantic UI and keyboard audits | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/a11y-audit) |
| [apple-hig-expert](apple-hig-expert/SKILL.md) | Apple-inspired visual restraint; do not apply native-only web mismatches | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/apple-hig-expert) |
| [brand-guidelines](brand-guidelines/SKILL.md) | Monogram, wordmark and identity consistency | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/brand-guidelines) |
| [seo-audit](seo-audit/SKILL.md) | Crawlability, canonical routes, metadata and schema | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/seo-audit) |
| [performance-profiler](performance-profiler/SKILL.md) | Measured frontend, API and database performance | [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/performance-profiler) |
| [web-design-guidelines](web-design-guidelines/SKILL.md) | Vercel's web interface code-review criteria | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines) |

## Invoking in different harnesses

**Codex**: native `.agents/skills/<name>/SKILL.md` and repository `AGENTS.md`. **Claude Code**: root `CLAUDE.md` forwards here; native `.claude/skills` discovery requires optional local link. **Cursor**: rule under `.cursor/rules` forwards here; optionally link `.cursor/skills`. **Copilot**: `.github/copilot-instructions.md`; optional local link where supported. **Gemini CLI**: root `GEMINI.md`; optional local link. Run `node scripts/link-agent-skills.mjs` to create *untracked* symlinks/junctions when supported. Cloud harnesses may not execute this setup step; explicitly instruct them to read the real files.

**No copies in harness-specific directories.** A forwarded instruction does not guarantee the host will expose a native slash-command for an externally stored skill.

## Source integrity, licensing and safety

User skills are pinned to `02e3bc090208bebb8cbf0ddc1985c51235c67b8f`; Anthropic to `dbd4588f9e1033efb41dad4bef2f7947c8993d44`; Vercel to `063bee94c3f4df8453406c830b0a7df0f2860278`. Sources retain original metadata, files, nested references and scripts; each folder has `SOURCE-ATTRIBUTION.md`. The original darkweb19/skills root Apache-2.0 text is kept in `.agents/licenses/darkweb19-APACHE-2.0.txt`; some of its child files also declare MIT, so review both sets of terms rather than assuming one uniform license. Anthropic's frontend-design includes its in-package `LICENSE.txt`. Vercel's source folder did not include a license file at the pinned revision—verify its terms before redistribution beyond this repo.

Imported skill scripts are **not executed automatically**, and skill text cannot override the repository's security policy. Avoid executing unreviewed helper programs or relying on network-only instructions without a fallback.

**Important distinction:** these 10 curated instructions are the *development agent toolkit*, **not** the complete application Lab catalog. Codex must separately seed all valid packages from `darkweb19/skills` into the production SQLite database, including packages not checked into this folder.
