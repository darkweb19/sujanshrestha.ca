# Sujan Shrestha

Personal portfolio, writing, and a persistent AI Skills Lab. Next.js 16 App Router, React 19, TypeScript, Node 24 native SQLite, and pnpm 11.

## Develop

Use Node 24.19.0 and pnpm 11.25.0 in the existing checkout.

```sh
pnpm install --frozen-lockfile
pnpm db:init
pnpm skills:sync
pnpm dev
```

The sync imports all 200 valid skill packages at the reviewed source SHA, including supporting files and licenses. It is idempotent. Development SQLite lives at `.local/portfolio.sqlite`; application reads never create or migrate databases. No secrets are needed for browsing/export. Owner imports, editing and removal require server-side credentials; see [Railway and security operations](docs/railway-sqlite.md).

## Validate

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# Start with SQLITE_PATH pointing to the initialized DB in production mode.
pnpm start
pnpm test:e2e
```

The browser suite needs Chromium/Playwright supplied by the host (override `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `TOOLKIT_BASE_URL`). Public checks run without a password. To test owner workflows locally, use a development server with private fixture credentials and pass `LAB_TEST_PASSWORD` through the environment. The runner reports skipped owner checks explicitly. Production owner writes require HTTPS.

## Architecture

- Portfolio and articles render on the server; only navigation, scheduling, copy actions and Lab interactions hydrate. No external font request or scroll-reveal dependency.
- `lib/portfolio.ts` preserves exact career/project/education facts from the baseline. Article Markdown, resume and portrait are unchanged.
- `lib/db` owns explicit migrations, indexed metadata queries, checked files and transactional writes. `app/api` enforces owner sessions, exact origin, CSRF, persistent rate limits and bounded imports.
- Public catalog metadata is server-rendered and paginated; package bodies load lazily for preview/export. Managed and owner-imported skills have separate namespaces.
- Existing browser-local imports remain recoverable through an explicit preview/backup/migration flow.

## Design and evidence

[Content baseline](docs/content-baseline.md) · [Two design concepts](docs/design-directions.md) · [Design system](DESIGN.md) · [Interaction contract](UX-CONTRACT.md) · [Measured verification](docs/redesign-verification.md)

## Deployment

Review the Dockerfile, `.dockerignore`, `railway.json` and [Railway runbook](docs/railway-sqlite.md). Use one instance, a persistent volume at `/app/data`, an explicit `SQLITE_PATH`, secure owner credentials and HTTPS. Startup migrates and seeds only an uninitialized catalog. Back up with SQLite's online backup API; test restoration separately. These files do not provision or deploy infrastructure. Do not merge or deploy this branch without owner approval.
