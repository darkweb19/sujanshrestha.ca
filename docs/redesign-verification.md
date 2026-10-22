# Redesign verification — 22 October 2026

## Evidence and scope

Independent QA covered the implementation on `feat/redesign`, with final current-source production build served locally on port 3003. Owner operations were exercised against a separate development server on port 3001 because production correctly refuses owner writes without HTTPS. No production infrastructure, deployment, real owner secrets or remote data were changed.

Tools: Chromium 154.0.8037.57, host Playwright, Lighthouse 13.5.0 and axe-core 4.14.0. Raw JSON, independently read ZIPs and desktop/tablet/mobile screenshots are retained under `/workspace/qa-artifacts/redesign-final`, `/workspace/qa-artifacts/redesign-final-tests`, and `/workspace/qa-artifacts/redesign-owner-dev`. These are local verification artifacts, not deployed website files.

## Engineering and functional results

| Check | Actual result |
| --- | --- |
| `npm run lint` | Passed; nonblocking Browserslist freshness notice |
| `npm run typecheck` | Passed |
| `npm test` | 74 passed, 0 failed, 0 skipped |
| `npm run build` | Passed; static home/blogs and dynamic SQLite Lab/API |
| `/api/health` | HTTP 200, `{"status":"ok"}` on the seeded production server |
| Production browser regression | 8 public groups passed; owner group explicitly omitted on local HTTP |
| Development owner/browser regression | All 11 groups passed, 0 skipped, 0 uncaught errors |
| Route/width matrix | Five public routes × 375/768/1440px: HTTP 200, one h1, expected canonicals, no horizontal page overflow |
| Legacy route | `/blog` returns HTTP 308 |

Browser groups exercise keyboard skip-to-main, immediate portfolio content without JavaScript, metadata-only paginated SQLite catalog, search/no-results URL state and reload/clear recovery, public write denial, complete skill preview and Escape, mobile-menu Escape/focus restoration, prompt installation assertions, and selected ZIP generation for Codex/Claude Code/Cursor/Copilot. An independent Python ZIP reader verifies exact paths and all original text/binary supporting bytes.

Owner browser groups exercise actual sign-in and Markdown/ZIP upload forms, CSRF rejection, safe URL rejection, editing, persisted content in a fresh browser context after reload, deletion cancellation and explicit confirmation. ZIP upload retains binary bytes `00 01 02 ff` and supporting JavaScript as inert files. Temporary imported fixtures were removed after the tests; no user data was deleted.

The 16 backend tests additionally verify migration repeatability, reopen persistence, transactional rollback, managed/user separation, idempotent sync, stale-write rejection, credential rotation, persistent rate limits, bounded streaming bodies, hostile paths, archive validation and consistent backup. Backend integration separately verified an actual public GitHub import through the inherited proxy with TLS verification, and the full upstream sync contains 200 valid packages / 1,498 files / 16,222,879 bytes. A second sync left all 200 unchanged and an independently reopened backup passed SQLite integrity checking. Actual Railway-mounted-volume restart behavior remains a deployment check.

## Content preservation

Independent extraction and JSON comparison against original commit `80a2e6e799be98e2daab781f26536ab8459018cc` confirmed exact equality for:

- All four employment records, including dates, titles, companies, locations, technologies and every highlight.
- All four projects, including complete descriptions, technology lists and external destinations.
- All five education records, including institution, period, description, country and GPA claims.

SHA-256 comparisons confirmed both published blog Markdown files, the resume PDF and original portrait are unchanged. The no-JavaScript browser checks confirm the preserved career/education/project facts are rendered as usable HTML. The complete inventory and comparison procedure remain in `docs/content-baseline.md`.

## Measured performance and SEO

Final production home, one Lighthouse mobile run with default simulated mobile throttling:

| Category / metric | Final production result |
| --- | ---: |
| Performance | 97 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.8 s |
| Largest Contentful Paint | 1.7 s |
| Total Blocking Time | 170 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 0.8 s |

A prior production run under concurrent browser activity scored Performance 96, with LCP 2.4s / TBT 150ms / CLS 0. This variation is why no perfect or guaranteed performance score is claimed.

Direct, unthrottled local home observations at 375/768/1440px: LCP 312/144/148ms, CLS 0 at each width, approximately 141.7kB transferred JavaScript. Synthetic narrow-screen menu interactions produced Event Timing durations of 16ms. These single-run local observations are **not** field p75 INP/CWV. No field INP or CrUX dataset is available; Lighthouse TBT is not INP.

The old baseline in `docs/redesign-baseline.md` is a development measurement (Performance 45, LCP 21.3s, TBT 3,040ms), so it is not a valid production-to-production speedup comparison. It still documents the original reveal/JavaScript/touch-target risks.

The SEO skill's authored evidence-matrix health score was 92.5/100; weakest categories were on-page snippet-length preferences and unavailable field INP evidence. Its separate raw HTML heuristic scored 79/100, preferring a longer 45-character title and shorter 190-character description; it also incorrectly treats the decorative footer monogram's intentional empty alt as missing text. Lighthouse SEO scored 100. These are different checks, not interchangeable claims about search rankings. Canonicals, author identity, Person/WebSite/BlogPosting data, sitemap, robots and existing routes were inspected. No Search Console, live indexing or ranking claim was tested.

## Accessibility and independent visual critique

The final axe WCAG A/AA-tagged scans found zero automated violations on home, blog index and Lab at all three widths. The home is fully visible without animation, neutral contrast is readable, keyboard focus and skip link work, dialogs contain focus, and the original tiny identity hit target has been replaced by generous branded navigation. The editorial masthead, authentic inset portrait, distinct project index and chronological records create a coherent personal portfolio. At 375px, the name, actions, portrait and timelines reflow without clipped controls or horizontal page overflow. The Lab's compact list, clear source previews and quiet archive workspace fit the same visual language.

**Remaining required correction:** both article templates still produce an axe `scrollable-region-focusable` finding for horizontally scrolling syntax-highlighted code. At 375px the reverse-proxy article has four affected code blocks; the Supabase article has one. Some remain at wider widths. `app/globals.css` gives `.prose code.hljs` horizontal overflow, while the generated element has no keyboard focus target. Make that scrolling element focusable, or move overflow to one focusable `<pre>` owner, preserve visible focus, then rebuild and rerun the article scans. QA reported this to the main implementation owner; it was not changed by the QA agent outside its assigned files.

Automated axe/Lighthouse scores do not certify full WCAG conformance. Physical mobile devices, Safari, screen readers and a complete 200% zoom matrix were not covered by this Chromium-based run.

## Reproduce

```sh
npm run lint
npm run typecheck
npm test
npm run build
# Start with a seeded SQLite path; see docs/railway-sqlite.md.
npm run start -- --port 3003 --hostname 127.0.0.1
TOOLKIT_BASE_URL=http://localhost:3003 node tests/redesign-browser.cjs
PORTFOLIO_BASE_URL=http://localhost:3003 PORTFOLIO_MODE=production \
PORTFOLIO_ARTIFACTS=/tmp/portfolio-final node scripts/measure-portfolio.cjs
```

For the owner suite, start a development server on localhost with a private nonproduction `LAB_ADMIN_PASSWORD`, `LAB_SESSION_SECRET`, matching `LAB_ORIGIN`, and a disposable/seeded `SQLITE_PATH`. Pass the same password through `LAB_TEST_PASSWORD` securely; never put it in a committed script or log. The browser runner reports owner checks as skipped when this variable is absent. Production owner access requires HTTPS and Secure cookies.

Optional host audit tools can be selected using `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `AXE_MODULE` and `LIGHTHOUSE_CLI`. The measurement script never claims a missing axe installation ran.

## Prioritized remaining work

1. Fix and revalidate keyboard-scrolling article code blocks before declaring accessibility acceptance complete.
2. Main integration must commit its outstanding application/configuration/design-document changes, reconcile the old browser-only UX documentation, and push the complete branch. QA committed only its assigned files.
3. Follow Railway's documented single-instance volume, startup/sync, secure credentials, HTTPS, backup and restore checklist. Verify actual volume persistence and owner Secure-cookie behavior after deployment is separately authorized.
4. Collect field CWV and perform Safari/screen-reader/physical-device review after release; keep synthetic and field evidence distinct.
