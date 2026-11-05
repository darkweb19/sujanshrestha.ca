# Skills Lab verification — 2026-11-05

Branch: `feat/skills-lab-premium`. Baseline: `d466bed`.

## Delivered behavior

- Portfolio-aligned workbench with searchable, paginated skill rows, category
  folders and all-skills browsing. Query/category/page/view restore through URL
  history. Initial and interactive pages both contain 12 results.
- Lazy, escaped Markdown reading with contents links, exact source, supporting
  file picker and existing owner editor. Raw HTML, scripts and remote images
  remain inert. No dependencies added.
- Named multi-selection across filters/pages, individual removal, sticky desktop
  export inspector and persistent safe-area-aware mobile review/download bar.
- Existing four harness adapters and ZIP generator preserved; archive contents
  and installation instructions remain available. Imports show queued filenames,
  sizes, individual removal, validation and pending feedback.
- Supplied YouTube live URL and existing lazy project-browser integration, with
  source and external fallback preserved. The remote app still blocks framing;
  the exact-origin companion patch and release prerequisite are documented in
  `youtube-live-preview.md`. No bypass, remote write or deployment occurred.

SQLite schema, APIs, authentication, CSRF, import transport, revision checks and
archive byte/path logic were not rewritten. Local verification seeded the
existing pinned 200-package catalog using the existing migration/sync scripts.
The database remained readable across local server restarts.

## Actual checks

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test` | 85 passed, 0 failed, 0 skipped |
| `pnpm build` | Pass; public routes remain static and Lab/API routes dynamic |
| `tests/premium-lab-browser.cjs` against built app | 11 workflow checks passed, no browser errors |
| `tests/redesign-browser.cjs` | Public checks pass against built app; complete owner flow also passed against disposable local development credentials, with no skipped owner checks in that run |
| `tests/refinements-browser.cjs` | Pass; clipboard fallback, raw source, category navigation, guarded dialogs and focus restoration |
| `tests/projects-browser.cjs` | Pass; six project dialogs, fixed YouTube URL, loading/blocked recovery, source link, keyboard/focus and 320–1440px layout |
| Premium strict static audit | 0 findings |
| Official `designmd lint DESIGN.md` | 0 errors, 0 warnings |
| Production axe scans | 0 violations at 375, 768 and 1440px; selected workflow also 0 |
| `git diff --check` | Pass |

Owner tests used generated local credentials, not production credentials. They
exercised empty-upload focus, queue removal, Markdown and ZIP imports, exact
script/binary preservation without execution, CSRF/SSRF rejection, guarded dirty
and pending saves, cross-browser reload persistence, and cancel/confirm deletion.
Production owner checks intentionally skip without that private fixture; this
does not negate the separate successful authenticated run.

All four browser-generated archives were unzipped and compared against selected
package API contents, checking exact paths and text/binary bytes. The new suite
selects two skills from different categories and verifies all supporting files.
Failure fixtures verify retained selections and retry before export. Review
caught and fixed page-size mismatch, no-op loading, void Markdown elements,
table whitespace, and disabled-trigger focus restoration before sign-off.

## Synthetic performance

One mobile Lighthouse run against the local production Lab: Performance **97**,
Accessibility **100**, Best Practices **100**, SEO **100**. LCP 2.513s, total
blocking time 35ms, CLS 0.0047; no Lighthouse run warnings. This is a synthetic
measurement, not field p75 Core Web Vitals or an accessibility certification.

Unthrottled browser observations: LCP 412/408/360ms and CLS
0.0050/0.0026/0 at 375/768/1440px. Initial script transfer was approximately
212KB; no skill Markdown bodies were embedded into catalog responses. No
pre-change equivalent performance run was captured for this scoped refinement,
so no improvement delta is claimed. Screenshots and raw reports remain local
review evidence under ignored `work/` and temporary QA artifact directories.

## Design reconciliation and release boundary

Runtime global colors, fonts and radii still match DESIGN.md; no palette drift.
The previous quiet index has intentionally evolved into a contained workbench
within that identity. DESIGN.md and UX-CONTRACT.md document the panel, reading,
selection, history and upload decisions alongside their canonical components.
Native selects and dialogs retain platform keyboard/focus ownership.

No schema migration or new environment variable is needed for this portfolio
change. Existing production SQLite volume and owner configuration remain
required. No production deployment, merge or infrastructure change is part of
this branch. The remote YouTube framing restriction is the remaining external
prerequisite; the included patch is prepared but not applied, Rust-tested or
deployed in the separate extractor repository.
