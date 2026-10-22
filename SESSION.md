# Redesign handoff

The approved working branch is `feat/redesign`. `AGENTS.md` and `docs/portfolio-redesign-brief.md` remain the canonical instructions. This branch implements the full redesign; nothing has been merged or deployed to production.

## Delivered

- Neutral personal-studio folio: original monogram, readable compact wordmark, typography-led portrait opening, full project index, complete experience/education, writing, contact, shared navigation, article templates and error pages.
- Public SSR pages with immediately visible content; system fonts and no Framer Motion dependency. All original facts are in `lib/portfolio.ts`; original posts, resume and portrait are preserved.
- SQLite-backed paginated Skills Lab with all 200 valid packages at the reviewed upstream SHA. Full sources/files load only on demand. Four harness exports and prompt behavior remain.
- Owner sessions, exact Origin/CSRF checks, rate/size limits, safe uploads/public GitHub imports, revision-based edits/removals, namespace separation and explicit legacy-browser recovery.
- Explicit migration/first-start seed, single-instance Railway image/runbook, health check and consistent online backup.

## Verification

See `docs/redesign-verification.md` for exact commands, measured outcomes and limitations. Unit/backend suite: 74 passed. Lint, type check and production build passed. Browser owner/public workflows passed; measured mobile Lighthouse: Performance97, Accessibility100, Best Practices100, SEO100. Synthetic observations are not field CWV evidence.

A fresh local production startup migrated and seeded 200 packages, returned healthy, and a second process startup retained all 200 without re-seeding. Actual Railway volume ownership/persistence remains a separately authorized deployment check. Local fixture credentials and databases are ignored and excluded from the Docker build context.

## Deployment prerequisites

Use Node24.19.0/pnpm11.25.0, one service instance, a writable persistent volume at `/app/data`, `SQLITE_PATH`, an exact HTTPS `LAB_ORIGIN`, and securely supplied owner password/session secret. Review `docs/railway-sqlite.md` and test a backup restore before production migration. Do not deploy, merge into main, change production infrastructure, or enter real secrets without owner authorization.

The supplied brand vectors are starter vectorizations; original source graphics for pixel-perfect tracing were not supplied in this task. Keep the current proportions/strokes unless authoritative originals are provided. Physical-device/Safari/screen-reader and field p75 Core Web Vitals review remain release follow-up work.
