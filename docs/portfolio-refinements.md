# Portfolio refinements — 2026-10-26

The owner authorizes changes to the existing portfolio, at least ten focused commits, and a push to `main`. This request supersedes earlier branch-only restrictions for this work.

Preserve the existing portrait, system typography, cobalt/ink palette, all professional facts, published routes, owner authentication, source bytes and four-harness exports. Extend the existing photo treatment with a gradual stronger blur. Display titles receive a static soft halo while their foreground stays legible; no animated reveal is required. An alternative of blurring the entire text was rejected because it weakens reading.

The Lab uses real category folders backed by server filtering and pagination, retaining selection across folders. Card activation copies the canonical raw source URL; selection and Preview remain separate controls. Clipboard errors expose a selectable URL. Public raw Markdown is served from SQLite with exact UTF-8 entrypoint bytes; owner imports retain a namespace to avoid collisions. Vercel forwards canonical source paths to the existing Railway Lab.

The shared native dialogs retain focus containment and restoration. Outside click and Escape use existing guarded close callbacks; pending writes cannot close, and dirty editors keep their discard confirmation.

Verification covers lint, unit/backend tests, type checking, production build, raw HTTP responses, clipboard success/failure, folder navigation, keyboard/modal behavior and mobile layouts. Local browser evidence is synthetic and does not establish field Core Web Vitals.

## Verification results

- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass; 80 unit/backend tests, no failures or skips.
- Local seed from the pinned cached upstream source validates and imports all 200 packages without altering their Markdown. Display categories are resolved at query time, so existing deployments need no migration or re-import.
- `node tests/refinements-browser.cjs` passes: card-surface clipboard copy, denied clipboard/manual URL, exact raw HTTP source, folder navigation and retained selection, outside click/Escape, inside-click retention, scroll/focus restoration, 375/768/1440px, empty-state reset, title/hero effects and forced colors.
- `node tests/projects-browser.cjs` passes: all six projects, keyboard containment, existing destinations and descriptions, blocked/slow preview recovery, scheduling, no-JavaScript content, and 320/375/768/1440px.
- `node tests/redesign-browser.cjs` passes for public and owner workflows. Owner checks use disposable process-only credentials and a local HTTPS proxy, with no production configuration changes. ZIP/Markdown upload, editing, persistent reads in a second browser, CSRF/SSRF rejection, deletion confirmation, dirty outside-close and pending-save outside/Escape guards pass; no skips or uncaught browser errors.
- Premium strict project audit reports zero findings. DESIGN.md lint reports zero errors and zero warnings. `git diff --check` passes.

The browser checks use Chromium on a local production build. Live Vercel-to-Railway rewrite propagation, Safari/physical-device behavior and field performance are not established by these tests. The existing hosting configuration deploys from the repository; this change adds only a raw-source rewrite alongside its existing Lab redirect.

## Reconcile drift

| Previous contract | Requested evolution | Resolution |
| --- | --- | --- |
| Hero blur limited to lower 128px/96px | Stronger gradient blur | CSS and DESIGN.md now specify a masked lower 46%/40% treatment with 16px/10px blur |
| Public-only blurred/dismissible dialogs | Consistent modal background and dismissal | Lab primitive shares the blur token and guarded outside/Escape behavior |
| Flat skill rows and incomplete category metadata | Category folders | Server taxonomy and folder filtering retain full pagination, source bytes and selection |
| Title labels toggle ZIP selection | Card activation copies raw source URL | Stretched semantic copy button; separate checkbox, Preview and raw link |
