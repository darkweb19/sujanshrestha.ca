# Redesign baseline — 22 October 2026

## Scope and reproducibility

The original implementation was measured at exact commit `80a2e6e799be98e2daab781f26536ab8459018cc`, before presentation changes. A temporary source archive at `/tmp/portfolio-before` shared installed dependencies and ran `npm run dev -- --webpack --port 3002 --hostname 0.0.0.0`. This is an isolated **development** measurement, not a production benchmark. No worktree, branch reset, live-site change, or deployment was performed.

Host tools: Chromium, Playwright, Lighthouse and axe-core. Lighthouse/axe were installed outside the checkout in `/workspace/qa-tools`. The command and raw artifacts remain in `/workspace/qa-artifacts/baseline`; screenshots are intentionally not shipped as application assets. The browser runner requests reduced motion and measures 375px, 768px and 1440px widths at 1000px height.

```sh
PORTFOLIO_BASE_URL=http://localhost:3002 PORTFOLIO_MODE=development \
PORTFOLIO_ROUTES=/ PORTFOLIO_ARTIFACTS=/workspace/qa-artifacts/baseline \
node scripts/measure-portfolio.cjs
CHROME_PATH=/usr/bin/chromium node /workspace/qa-tools/node_modules/lighthouse/cli/index.js \
http://localhost:3002 --quiet --chrome-flags='--headless --no-sandbox' \
--max-wait-for-load=30000 --only-categories=performance,accessibility,best-practices,seo \
--output=json --output-path=/workspace/qa-artifacts/baseline/lighthouse-isolated-mobile.json
```

## Measured results

One Lighthouse mobile run with default simulated mobile throttling:

| Category / metric | Original development result |
| --- | ---: |
| Performance | 45 |
| Accessibility | 96 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.0 s |
| Largest Contentful Paint | 21.3 s |
| Total Blocking Time | 3,040 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 2.4 s |

The development server, HMR, unoptimized scripts and local CPU contention materially affect these values. They must not be described as original production performance or used to promise a percentage improvement over a final production build. There is no field p75 CWV or CrUX evidence; Lighthouse Total Blocking Time is not INP.

Direct browser observations (single local navigations, no CPU/network throttling): warm 768px/1440px LCP was 1.83s/1.90s; cold 375px LCP was 8.82s and included first compilation. All three observed CLS values were zero. Initial development JavaScript transfer was about 3.30 MB. No horizontal page overflow was detected.

## Independent findings

| Priority | Evidence | Finding / required correction |
| --- | --- | --- |
| High | `measurements.json`, home at 375px | axe `target-size`: the `.tracking-tight` identity link measures about 14.7 × 20px and is too close to its neighbors. Use a generously sized brand hit target. |
| High | `home-1440.png`, full-page reduced-motion capture | Below-fold scroll reveals initially leave most sections invisible. Render meaningful portfolio content immediately and do not depend on scroll-triggered opacity to reveal it. |
| Medium | Browser DOM at all widths | Home has no canonical link. Give home, blog index, Lab and article templates explicit correct canonicals. |
| Medium | Source audit | Home sections are client components with Framer Motion and dynamic placeholders. Prefer Server Components and a small interactive shell. |
| Medium | Existing Lab source | Only ten built-ins, IndexedDB writes and client-only filtering; full database-backed catalog and authenticated server writes are required by the new brief. |

Axe reported one automated WCAG-tagged violation on the narrow home and zero at 768px/1440px. This does not establish full WCAG conformance. Actual keyboard, modal, responsive, content-preservation, API authorization and persistence checks remain part of final verification.

## Prioritized action plan

1. Replace client-driven portfolio sections with immediately visible semantic server-rendered content while retaining all facts.
2. Give navigation generous touch areas and keyboard focus, and preserve the same accessibility quality in Lab dialogs and owner management.
3. Implement explicit canonicals and grounded structured data without changing public routes.
4. Validate the new SQLite-backed Lab with authorization, CSRF, hostile-import, repeatability, restart and export checks.
5. Measure the final production server separately and report actual results with the development baseline limitation above.
