# Skills Lab refinement — 2026-11-05

## Scope and evidence

Preserve the working Next.js/SQLite catalog, owner session/Origin/CSRF checks,
revision-based edits, imports, legacy recovery and canonical archive adapters.
No schema migration, catalog rewrite, deployment or infrastructure change.
The baseline is the existing `SkillsToolkit`, `SkillPreview`, `ImportSkills`,
`ProjectBrowser`, `lib/db/catalog.ts` and four harness adapters. Public catalog
responses contain metadata; detail requests load complete packages lazily.

The requested live UX researcher skill was fetched from
https://sujanshrestha.ca/lab/skills/ux-researcher-designer/skills.md and read.
Its usability-test workflow informs the checks below. These are engineering
observations and task hypotheses, not invented interviews or user research.

## Two directions

1. **Repository workbench (selected):** compact introduction, searchable library,
   familiar category folders, precise package rows and a sticky export inspector.
   A named selection list connects discovery to the exact exported file tree.
2. **Command palette first:** a large search launcher and full-screen results.
   Rejected: hides category discovery and makes simultaneous comparison and
   multi-selection harder, especially on touch screens.

Keep the portfolio's cool white `#f5f7fc`, white `#ffffff`, subtle `#edf0f9`,
cobalt `#3155e7`, ink `#17233b` and muted `#526075`. Runtime globals own values.
Arial/Helvetica carries headings and body; system monospace identifies paths.
The signature is a small package-to-agent path diagram in the introduction,
followed by the real export inspector. It describes the tool's actual job.
No decorative terminal, additional font request or animation dependency.

## Workflow and acceptance

- Discover: retain category folders; add an explicit paginated all-skills view.
  Query/category/page/view survive reload and browser navigation.
- Evaluate: render Markdown with headings, lists, code and tables. Raw HTML is
  inert, unsafe URLs are rejected, images are not fetched, and exact source remains
  available. Editing still uses original bytes and guarded close.
- Select: keep selections across folders/pages; show names and remove actions in
  the inspector. Desktop inspector stays reachable in short viewports; mobile
  has a persistent count, review link and download action above its safe area.
- Export: retain original adapters and byte-preserving ZIP generator. Verify
  multiple skills, all four harness roots and supporting files in a browser.
- Import: keep owner authorization and existing transport. Add clear queued-file
  feedback/removal, pending feedback and preserved retry input.
- Verify: empty, loading, failed detail/search/download, owner upload/edit/delete,
  keyboard focus restoration, 375/768/1440 widths, reduced motion and axe checks.

## YouTube live preview constraint

The supplied live URL returns HTTP 200 but currently sends CSP
`frame-ancestors 'none'`. Browsers correctly refuse cross-origin embedding.
Use the existing fixed-URL project browser with an honest notice and external
link; never proxy away CSP or claim an iframe load event proves rendering.
A separate change in that app must explicitly allow the portfolio origin before
the embedded live content can render in production.
