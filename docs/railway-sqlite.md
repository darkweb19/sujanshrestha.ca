# Skills Lab: SQLite and Railway operations

## Architecture and access policy

The public catalog reads minimal metadata from SQLite on the server. Complete package files are loaded only for preview/export. The database is the shared source of truth across browsers; IndexedDB is retained solely for explicit, consented legacy import migration. Public visitors can browse, preview, select and export. Only the site owner can create, edit or remove uploaded skills. Uploaded files and scripts are inert bytes and are never evaluated.

Node **24.19.0** supplies native `node:sqlite` (SQLite 3.53.3 in the verified runtime). It removes a native third-party driver and its install toolchain. Node labels the API experimental on some Node 24 releases; pin the runtime and re-run the persistence/security tests when upgrading. WAL, foreign keys, a 5-second busy timeout, strict constraints, versioned migrations, content checksums, namespace uniqueness and `BEGIN IMMEDIATE` batch transactions are explicit. One file has one service instance/writer; a local volume cannot support stateless horizontal scaling.

`skills`, `skill_files`, `source_sync_runs`, `schema_migrations`, `admin_sessions` and `rate_limits` are the persistent tables. `upstream:<slug>` and `user:<slug>` separate ownership. Upstream sync cannot overwrite owner imports. Owner editing/removal checks a numeric revision to reject stale writes. SHA-256 is verified again when complete packages are read.

## Upload skills from the Lab

1. Open `/lab/codex` and choose **Upload skills** beside the library heading. The supported formats and owner-access state are visible before signing in.
2. Sign in with the owner password. The upload entry continues directly to the **Upload skills** dialog and its **SKILL.md or ZIP archives** file field.
3. Choose a Markdown package or ZIP, then **Upload files**. The existing owner-authenticated endpoint validates and saves it to SQLite. GitHub imports are available in the same dialog. Refresh or open another browser to confirm the saved package.

If the dialog says uploads are not enabled, configure `LAB_ADMIN_PASSWORD` (at least 16 characters), `LAB_SESSION_SECRET` (independent random secret, at least 32 characters), and `LAB_ORIGIN` (exact public HTTPS origin, no path) on the service serving the Lab API, then redeploy. Keep `SQLITE_PATH` on its persistent Railway volume. These are server-only settings, never `NEXT_PUBLIC_*` variables.

For a Vercel frontend with a Railway Lab, the public Lab page and its same-origin `/api/lab/session` and `/api/skills` requests must reach the deployed Lab service. `LAB_ORIGIN` is the browser-visible Lab origin, not an internal Railway hostname. Merely setting credentials on a different service does not connect the APIs. A 404 from `/api/lab/session` means the endpoint is not being served at that public URL; deploying/routing this branch's Lab is necessary before owner login can work. This branch does not change production routing or secrets.

## Local development

Use Node 24.19.0 and the existing isolated checkout. Do not create a Git worktree unless specifically requested.

```sh
pnpm install --frozen-lockfile
pnpm exec tsx scripts/db-init.ts
pnpm exec tsx scripts/sync-all-skills.ts
pnpm dev
```

The default development file is `.local/portfolio.sqlite`; set `SQLITE_PATH` to a different writable path if needed. Application reads never create/migrate a missing database. `db-init.ts` is repeatable. The app build does not need a database or secrets.

Owner access is disabled until secure environment settings provide all of:

| Variable | Requirement |
| --- | --- |
| `LAB_ADMIN_PASSWORD` | A unique password of at least 16 characters. Never commit it or use the test fixture in production. |
| `LAB_SESSION_SECRET` | Independently generated random secret of at least 32 characters. Rotation invalidates every session. |
| `LAB_ORIGIN` | Exact external origin, e.g. `https://sujanshrestha.ca`, without a path/query/fragment. Required in production. |
| `SQLITE_PATH` | Absolute persistent SQLite path in production. |

Production requires HTTPS. Login compares scrypt-derived values in constant time. Session tokens are random, stored only as hashes in SQLite, expire after eight hours, and use HttpOnly, Secure (production), SameSite=Strict cookies. Password rotation invalidates existing sessions. Login and every mutation validate the exact Origin; mutations additionally require the session CSRF token. Server-side persistent login/write limits, byte/count limits, ZIP validation and frontmatter reparsing apply independently of the UI. Ensure the Railway edge sanitizes forwarding headers; a global login limit also bounds spoofed per-address attempts. No admin password, session secret or GitHub token is sent to public JavaScript.

The deployment operator chooses actual credentials and volume configuration; this change does not provision infrastructure or set production secrets.

## First Railway deployment

1. Create/choose a single service and attach a **persistent volume mounted at `/app/data`**. Set volume ownership so runtime uid/gid 1000 can write the mount. The image's directory ownership cannot change an already mounted volume's ownership. Do this once through Railway's volume permissions/admin shell; never make it world writable.
2. Set `SQLITE_PATH=/app/data/portfolio.sqlite`, `SKILLS_SOURCE_DIR=/app/data/skills-source`, `SKILLS_SYNC_REPORT=/app/data/skills-sync-report.json`, the exact HTTPS `LAB_ORIGIN` and both secrets through Railway settings. Set one replica. Do not mount the source tree or `.next` as the database volume.
3. Review `Dockerfile`, `.dockerignore` and `railway.json` before deploying. The Docker runtime includes the TypeScript runner used by explicit startup/migration commands. Do not install with `--prod` unless separately compiling those operational scripts.
4. `scripts/db-start.ts` migrates explicitly at process start, synchronizes the complete pinned source only on the first empty installation, then launches Next. Subsequent restarts retain the catalog and require no GitHub call. Health stays unavailable until one sync completes. Keep outbound HTTPS GitHub access available for first seed and deliberate refreshes.
5. Verify `/api/health`, public catalog, owner authentication/upload, reload in another browser, process restart and another reload. Do not treat an open port as proof of persistence.

This repository has not changed production infrastructure or deployed this configuration. Confirm actual volume persistence and writable permissions in Railway before routing production traffic. A cloud-workspace SQLite restart/backup test is evidence for application persistence, not proof of a mounted Railway volume.

## Complete upstream synchronization

`scripts/sync-all-skills.ts` pins `darkweb19/skills` at `02e3bc090208bebb8cbf0ddc1985c51235c67b8f`. It uses an HTTPS Git cache, verifies Git objects, inventories the entire recursive tree (no truncated/paginated API assumption), discovers every `SKILL.md`, and reads original supporting files as inert blobs. Root license/notice texts are preserved in each package under `source-license/`. Public GitHub imports use fixed API/raw origins, deny redirects and verify each downloaded blob against its pinned Git object hash.

The validated source contains **200 packages**: 200 discovered, 200 accepted, zero rejected. The per-package report includes source path, count and checksum; its complete contents are persisted in `source_sync_runs` and written to `.local/skills-sync-report.json` (or `SKILLS_SYNC_REPORT`). A repeated sync updates changed content and leaves unchanged revisions intact. It never removes old catalog entries or user uploads automatically; review source removals explicitly rather than deleting data silently.

To refresh intentionally, review a new exact SHA, change the pin, run the job, inspect its accepted/rejected report and commit the reviewed pin. Validation rejects traversal, symlinks/submodules, unsupported metadata, malformed UTF-8 entrypoints, aliases, oversized or ambiguous packages. Individual package limits remain 256 files, 2 MB/file and 25 MB expanded. The job reports rejected packages rather than falsely claiming they were imported.

## Backup and recovery

Before migrations, refreshes or restore operations, create an online consistent backup:

```sh
pnpm exec tsx scripts/db-backup.ts /app/data/backups/portfolio-YYYY-MM-DD.sqlite
```

The script uses SQLite's backup API and refuses to overwrite an existing backup. It is safe while WAL is active; copying only the main live `.sqlite` file with `cp` is not a consistent backup. Export the resulting backup to separately secured storage outside the same Railway volume; same-volume backups do not protect against volume loss. Backups contain uploaded content and hashed session tokens, so restrict access, encryption and retention to the owner's policy. Scheduling/remote storage is an operator responsibility.

For recovery, stop the service, archive the current database and its `-wal`/`-shm` sidecars, restore a verified backup to the configured path with uid/gid 1000 and mode 0600, remove only obsolete sidecars after preservation, then start once. Run `PRAGMA integrity_check`, inspect sync history/counts and verify a known uploaded package. Rotate session credentials if the backup's custody is uncertain. Test restoration on a separate path before replacing production data.

## Verification performed in the cloud workspace

Backend tests exercise repeatable migrations, reopen persistence, exact binary/supporting bytes, atomic rollback, namespace isolation, sync idempotence, stale updates/deletes, a consistent independently opened backup, Origin/CSRF/session authorization, credential rotation, persistent rate limits, streaming body limits, authenticated import/public read and SSRF/blob-integrity checks. Actual full-source sync and a second idempotent sync are run separately. No production deployment or external-volume assertion is implied.
