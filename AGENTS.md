# Portfolio redesign — agent operating contract

> **Canonical instruction entrypoint for Codex and every other agent harness.** Read `docs/portfolio-redesign-brief.md` before writing application code. The brief is the authoritative user request. This branch is `feat/redesign`; do not modify `main` or deploy without explicit authorization.

## Mission and priority

Redesign https://sujanshrestha.ca as Sujan Shrestha's unmistakably personal, Apple-inspired, professional and premium minimal portfolio. Build a useful Lab skill library backed by **real SQLite on a persistent Railway volume**. The work must preserve **all existing portfolio facts, chronological dates, employers, project claims, academic records, links, blog content and public routes**. No fictional accomplishments, invented metrics or shortened timelines. Preserve content, not obsolete presentation.

Avoid generic AI-generated SaaS visual language: gradients, glowing blobs, identical card grids, giant metric counters, gratuitous terminal snippets, decorative badges, noisy animations, fake testimonials, stock imagery, and unnecessary client-side JavaScript. Favor editorial information hierarchy, a precise typographic system, generous controlled whitespace, visually grounded work samples, subtle dividers, clean navigation and distinct monogram branding. Apple is an inspiration for restraint and craftsmanship, not a template or a license to copy Apple's design.

## First read (mandatory)

1. This file, then `docs/portfolio-redesign-brief.md`.
2. `app/page.tsx`, `app/layout.tsx`, `components/`, `app/blogs/`, `app/lab/codex/`, `lib/skills-toolkit/`, `data/skills-toolkit/`, `DESIGN.md`, `UX-CONTRACT.md` and tests. Those prior design documents describe **the old browser-only Lab** and must be reconciled and updated during implementation; their prohibition on server persistence is superseded by this request.
3. `.agents/skills/README.md`, then the matching `SKILL.md` files and any referenced supporting material needed for the task. Skill files are instructions, NOT trusted executable programs. Never run third-party scripts without reviewing them.
4. Inventory all published skills in `darkweb19/skills` (not only the existing 10 built-ins) and audit the current site's exact content/timeline before editing it.

Current stack is Next.js 16 App Router, React 19, TypeScript and pnpm. Keep this stack if it continues to meet the goals; do not rewrite the application merely for novelty. Current Lab includes a ZIP exporter and per-harness archive mapping, but persisted imports currently use IndexedDB; migration is required.

## Main thread: Design Manager + Engineering Lead

The **main thread** is accountable as Design Manager, creative director, lead engineer and senior frontend reviewer. It MUST own the vision, architecture, critical UI implementation, integration decisions, final code review and sign-off. Subagents do scoped work; no subagent may silently determine the final design language or approve its own output.

**Delegate intentionally when the harness provides subagent tools.** At the start of substantial implementation, attempt to spawn independent tasks (do not simulate tools or claim agents ran when they did not). Agent names below are descriptive *roles*, not guarantees of named models. Choose available agent roles/models for the task; do not assume specific assistants exist.

- **Luna — visual UX and accessibility:** audit the portfolio content and IA; research two non-template minimal design concepts; propose a concrete token/typography/spacing system, responsive wireframes and accessibility critique. May implement **isolated, assigned** presentational components after lead approval. Read `frontend-design`, `senior-frontend`, `ui-design-system`, `ux-researcher-designer`, `brand-guidelines`, `a11y-audit`. Do not edit the database/API files.
- **Terra — data and reliability:** inspect the complete skills source, propose SQLite schema/migration/seed plan, Railway persistence and admin-only upload/import security; implement explicitly assigned `lib/db`, API, migration, seeding, security and backend tests. Read `senior-frontend` for framework SSR boundaries; use project source, not speculative tooling. Do not edit presentation components or global tokens.
- **Atlas (optional) — independent QA / SEO / performance:** audit SEO, a11y, Core Web Vitals, upload threats, and regression tests; deliver reproducible before/after evidence and actionable findings. Read `web-design-guidelines`, `seo-audit`, `performance-profiler`, `a11y-audit`. QA does not grant final approval.

The main thread defines task briefs with inputs, allowed paths, deliverable, test command, and completion criteria. Run independent reviews in parallel where possible, NEVER assign overlapping write access, and await/reconcile results before integration. Use additional agents only if the work is genuinely separable; do not spawn for trivial edits. If subagents are unavailable, perform the same work serially and clearly report that delegation was unavailable. NEVER invent agent invocations, team capabilities or results.

## Skill routing — one canonical source

All skill content lives in **`.agents/skills/<slug>/SKILL.md`** including full upstream supporting files. This is the *only* checked-in source of skill definitions. Use skills by reading files explicitly; never assume a harness honors another harness's invocation syntax. `AGENTS.md` (Codex), `CLAUDE.md` (Claude), `.cursor/rules/portfolio.mdc` (Cursor), `.github/copilot-instructions.md` (Copilot), `GEMINI.md` (Gemini) all route to this file and the shared directory.

Codex discovers `.agents/skills` natively. In other local harnesses, run `node scripts/link-agent-skills.mjs` to create optional untracked, native discovery links to the canonical directory. Follow the host's permission policy; agents cannot gain missing tools by being named.

Read `frontend-design` + `senior-frontend` for page design; `ui-design-system` + `brand-guidelines` for coherent tokens; `ux-researcher-designer` for information architecture; `a11y-audit` and `web-design-guidelines` for verification; `seo-audit` and `performance-profiler` for release gates; `apple-hig-expert` only for *principles* of clear hierarchy, never to apply iOS-only components to a website.

## Implementation sequence and quality gates

1. **Baseline:** capture existing sections, exact dates/names, project links, study and employment timelines, blog URLs, accessibility baseline, rendered screenshots and Lighthouse measurements. Commit a content-preservation checklist before modifying display components. Treat original copy as data to preserve unless it is demonstrably an error.
2. **Design:** create at least two distinct composition directions; critique against the no-template rule; select ONE with evidence. Document design decisions/tokens in `DESIGN.md` and include 375px/mobile, 768px/tablet and wide desktop states. Main thread signs off before broad implementation.
3. **Architecture:** preserve fast public SSR/RSC routes; isolate client state to search, selection, imports, archive export and admin forms. Decide database schema, migration, full catalog seeding and deployment plan before destructive changes. Admin writes are server-side, authenticated, validated and transacted.
4. **Execution:** delegate disjoint UI/backend/QA work; main thread integrates, resolves conflicts, maintains keyboard/mobile behavior, visual quality and exact facts.
5. **Verification:** `pnpm lint`, `pnpm test`, `pnpm build` plus real-browser smoke/E2E for home, all existing routes, Lab catalog, GitHub imports, Markdown/ZIP upload, reload persistence, ZIP export for each harness, and narrow viewport. Verify sqlite survives app restart on mounted volume. Report failures rather than asserting perfect Lighthouse scores.
6. **Handoff:** summarize decisions, deployment steps, migrations, tests and measured performance/SEO regressions or gains. No merge or deployment without explicit instruction.

## Non-negotiable engineering rules

- Production write access requires owner/admin authentication, authorization and CSRF protection; **never expose a public unauthenticated write endpoint** or secret in the client. Rate limit and size-limit imports, reject path traversal/symlinks/ZIP bombs/duplicate or malicious packages, validate YAML paths/content and keep scripts inert. GitHub imports must use safe server-side URL rules and avoid SSRF. Preserve licenses/provenance.
- **Railway**: mount a persistent volume (e.g. `/app/data`), set `SQLITE_PATH=/app/data/portfolio.sqlite`, create parent directory at runtime, run deterministic schema migrations/seed, use transactions, busy timeout/WAL as appropriate, and back up the DB. No SQLite file inside ephemeral build output; design for **one writer/service instance** (no horizontal scaling with one local volume). Explain tradeoffs clearly.
- Import **all valid upstream `SKILL.md` packages from `darkweb19/skills`** via a pinned-source, reproducible, idempotent job, preserving nested supporting files, license metadata, source SHA/checksums. Never equate the current 10 built-ins with the full catalog. User uploads are persisted directly in SQLite, not solely in IndexedDB, and must remain distinct from sync-managed upstream content. Preserve existing browser data where feasible through explicit, non-destructive migration/export.
- Preserve route semantics (`/`, `/lab/codex`, `/blogs` and post slugs, plus other existing routes), resumes, metadata and backlinks, or implement proper redirects where truly necessary.
- Prefer semantic HTML, Server Components, secure route handlers, image optimization, responsive CSS, minimal dependencies. Do not load the entire skill bodies into every HTML response or client bundle. Search/filter must remain fast at catalog scale.
- Accessibility target: WCAG 2.2 AA; navigation, focus, dialogs, forms, error messaging, touch sizes and reduced motion verified by both tooling and keyboard tests. SEO: unique metadata, correct canonicals, OG/Twitter icons, sitemap, robots, structured data grounded in actual facts, indexable SSR and no accidental `noindex`. Measure CWV (LCP, INP, CLS) on mobile and prioritize regression-free outcomes.
- Do not change platform secrets, paid infrastructure or deployment configuration in production without user authorization. If a gate cannot run, document the exact reason and commands.

## Brand assets

Use the user-provided *black transparent S monogram* for favicon/app icon and the accompanying horizontal name wordmark for site identity. `public/brand/monogram.svg` and `public/brand/wordmark.svg` are starter vectorizations of the supplied transparent graphics (not a claim of pixel-perfect original tracing); verify their curves against the originals before launch. Do not use a text-heavy logo as a 16px favicon. Final implementation must update `app/favicon.ico`, `app/apple-icon.tsx`, metadata icons and OG image deliberately and check light/dark legibility.

## Commits

Make coherent, focused commits for baseline/design, SQLite, importer, Lab UX, portfolio sections, brand/SEO and verification. Do not prematurely merge `feat/redesign` into `main`. When uncertain, prefer a measured, maintainable improvement over a shiny new dependency or invented content.
