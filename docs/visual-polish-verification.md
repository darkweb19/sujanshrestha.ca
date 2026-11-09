# Portfolio visual polish — final verification, 2026-11-09

Branch: `feat/portfolio-visual-polish`. Baseline: `e351e8b` (main after PR #9).

## Delivered refinements

- Shared 160/200ms CSS timing, complete public/Lab control states, consistent
  secondary-link underlines, visible keyboard focus and static reduced-motion
  interactions. Ordinary title halos were removed; photo contrast remains.
- Sticky header with matching anchor clearance, route/fragment indications, and
  a mobile disclosure that closes on Escape, outside pointer, navigation/history
  and desktop resize. Short menus scroll and resize restores useful focus.
- Balanced headings, readable long labels, aligned sections and contact links,
  stable contact-copy feedback, and safer article/code/table overflow.
- More precise project borders/focus/pressed states; the Outpost diagram's
  previously white-on-white central label now uses the intended cobalt surface.
- Short project windows scroll complete content with a sticky close row and a
  useful minimum live-frame height, instead of collapsing content to about 18px.
- Lab fields/buttons/disclosures distinguish hover, focus, press, disabled and
  busy states. Dialog focus wraps around visible loaded controls while retaining
  existing dirty-editor and pending-write protections.

Luna (`gpt-6-luna`, Max) implemented the navigation scope. Terra
(`gpt-6.1-terra`, Max) implemented Lab polish and independently identified the
short-viewer issue. The lead owned direction, integration, shared/public styling,
the viewer fix, final review and verification. Both requested public design/UX
skills were read. No invented research interviews or field performance claims.

The existing light-only identity is preserved under both OS appearance settings.
No animation dependency, dark theme, schema/API/import/export rewrite or new
production configuration is introduced. The TypeScript scratch-directory exclusion
matches the existing Git/ESLint exclusion for ignored `work/` intermediates.

## Preservation and live-preview exception

Checksums confirm original blog Markdown, resume and brand assets are unchanged.
Comparison against the baseline confirms `lib/portfolio.ts` differs only by removal
of the obsolete YouTube blocked-preview notice: career facts, dates, descriptions,
technologies and destinations are unchanged. SQLite-backed behaviors remain owned
by the existing server implementation and canonical harness adapters.

The remote extractor now sends the exact canonical portfolio `frame-ancestors`
allowlist. A real remote iframe loaded its heading/controls under an allowed-origin
local browser fixture without errors. No extractor source, infrastructure, token
or authenticated media operation was changed. See `youtube-live-preview.md`.

## Actual validation

| Check | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test` | 85 passed, 0 failed, 0 skipped |
| `pnpm build` | Pass; public rendering and dynamic Lab/API boundaries preserved |
| Official `designmd lint DESIGN.md` | 0 errors, 0 warnings |
| Premium strict static audit / `git diff --check` | 0 findings / pass |
| `portfolio-polish-browser.cjs` on production | Pass: six routes including 404, 320/375/768/1440px, appearance preferences, sticky anchors, native disclosures, project focus, short live frames, copy success/fallback, forced colors and zoom-equivalent reflow |
| `navigation-polish-browser.cjs` on production | Pass: URL indications, keyboard order, Escape/outside/route closure, short viewport and desktop-resize focus |
| `lab-polish-browser.cjs` on production | Pass: control states, busy state, loaded-control Tab wrapping/restoration, long labels, bounded archive and narrow/short dialogs |
| Existing premium Lab / project browser suites | Pass: two-package exact ZIP paths/bytes for all four harnesses, selection/history/recovery, six project dialogs and slow/blocked recovery |
| Existing refinements browser suite | Pass: source copying/fallback, category retention, guarded dialogs/focus and updated crisp-title policy |
| Authenticated redesign browser suite | Pass with disposable local credentials: upload validation/queue, Markdown/ZIP, inert script/binary retention, edit, dirty/pending guards, cross-browser persistence, CSRF/SSRF checks and confirmed deletion; no skipped owner checks |
| Production measurements | All five public routes at 375/768/1440px: 15/15 HTTP 200, no horizontal overflow, browser errors or axe violations |

The final mobile contact-spacing adjustment was rebuilt and the site-wide browser
suite rerun successfully. Native disclosures and full professional content were
also verified with JavaScript disabled by the existing regression suites. Project
images were checked after scrolling/decode as well as full-page capture.

## Before/after synthetic observations

The unchanged baseline was built in an isolated snapshot and served separately.
Both Lighthouse passes used mobile defaults against local production servers.
These are single synthetic runs, not field p75 data or a certification.

| Route | Performance before → after | Accessibility / Best Practices / SEO after | LCP before → after | CLS after |
| --- | --- | --- | --- | --- |
| Home | 96 → 95 | 100 / 100 / 100 | 2.822s → 2.861s | 0 |
| Lab | 100 → 97 | 100 / 100 / 100 | 1.923s → 2.510s | 0.0047 |

The runs remain at the project's Lighthouse performance floor, but do not establish
a speed improvement. Home LCP remains above the 2.5s field target in this synthetic
configuration; no field INP measurement is available. Initial observed script
transfer increased from 148,815 to 150,320 bytes on public content routes and
211,974 to 213,714 bytes on the Lab. The roughly 1.5–1.7KB increase supports the
navigation lifecycle/focus handling and Lab dialog guard; no animation framework
was added. Unthrottled matrix scans retain zero CLS on content routes and about
0.005 on the Lab; their timings are not comparable to throttled Lighthouse LCP.

Screenshots, browser results, raw measurements and Lighthouse JSON remain under
ignored `work/polish/`. DESIGN.md and UX-CONTRACT.md now document the intentional
halo removal, tokens, sticky navigation, focus behavior and short-viewer layout.
No merge, remote push, deployment or production configuration change was made
for this branch.
