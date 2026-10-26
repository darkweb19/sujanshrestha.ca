# Skills Lab interaction contract

Scope: `/lab/codex` is a public, server-rendered SQLite catalog with owner-only management. English is the supported interface language. Complete imported bytes, Unicode and source metadata remain intact. The redesign brief supersedes the old browser-only storage policy.

## Business sources

| Rule | Authoritative source | UI consequence |
| --- | --- | --- |
| Public reads; owner writes only | `docs/portfolio-redesign-brief.md`, `AGENTS.md` security rules | Browsing, preview and exports require no account; import/edit/delete require owner sign-in |
| Managed/user namespaces; persistent packages | Same brief, `lib/db/connection.ts` constraints | Upstream packages are read-only; user packages editable with revision checks |
| Persistent single-instance SQLite | Same brief, `docs/railway-sqlite.md` | Successful imports visible after reload and across browsers; unavailable DB gives retry state |
| Existing browser data preserved | Same brief | Explicit recover/backup/migrate flow; no automatic IndexedDB deletion |

## Canonical UI map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Card selection | `SkillsToolkit.tsx` selected IDs | This contract | Individual, all shown, clear | Four-harness ZIP browser checks |
| Select/Listbox | Native `select`, shared toolkit form CSS | DESIGN.md + this contract | Harness, category, file | Native keyboard/popup accepted |
| Form | `ImportSkills.tsx`, `SkillPreview.tsx`, `PromptLauncher.tsx`, owner sign-in in `SkillsToolkit.tsx` | `validation.ts`, server auth/API | Import, edit, task, sign-in | Invalid input, preserved values, upload/edit browser flows |
| Scrollbar | `app/globals.css` | DESIGN.md runtime tokens | Page, source, archive, dialog | Narrow layout and computed style |
| Feedback | `ToolkitPrimitives.tsx` Feedback | This contract | Inline status, alert | Import, download, session and network errors |
| Dialog | `ToolkitPrimitives.tsx` Dialog | This contract | Import, preview/editor, removal, sign-in | Focus, Escape, return focus |
| CRUD | `client-api.ts`, `lib/db/catalog.ts`, `app/api/skills` | Brief + schema + server auth | User packages only; managed reads | Browser cross-context persistence + backend transaction/revision tests |

Native selects intentionally accept OS-owned popup geometry/keyboard semantics. Inline feedback remains visible and actionable; no separate transient toast provider is needed. Shared buttons, feedback, dialog and native field styling are reused across owner workflows.

## Catalog, search and selection

The server renders the first page of minimal catalog metadata from SQLite. Complete source bodies are never embedded in initial catalog HTML/client modules. Database search matches name/description; category combines with query. Pages contain 12 results. Search commits to URL query parameters after 300ms; IME composition is respected, requests are canceled or ignored when superseded, and clear resets immediately and restores input focus. Back/forward navigation restores query/category/page. No results offers clear/reset; DB/network failures offer retry without representing unavailable data as a successful empty library.

Selection begins empty and is independent of query/page. Select all shown adds this page while retaining other selections; Clear selection clears all. Full selected packages load lazily so the tree, count and exports have actual supporting-file paths. Selection changes and harness changes invalidate installation confirmation and generated prompts. Pending operations retain appropriate controls and explicit busy feedback.

## Archive and prompt

Exports freeze the selected set and harness while validating/loading packages. Failure retains selection and gives retry. ZIP root paths come from canonical harness adapters: `.agents`, `.claude`, `.cursor`, or `.github`. Every selected supporting byte is retained; compatibility warnings remain visible. Downloading a ZIP never claims installation.

Prompt requirements are mandatory and a missing task receives focused feedback. Prompt paths derive from the adapter, not duplicated UI path maps. Until the user explicitly asserts installation in the target repository, generated text requires verification/installation. Task, selection, harness and confirmation changes mark an existing prompt stale. Clipboard failure preserves and focuses editable text. Codex Web is a plain external link without prompt or installation query parameters.

## Authentication and persistent import

Owner sign-in uses a masked password input. Password and session secret are configured securely on the server, never bundled or persisted in browser storage. If configuration is absent, management stays disabled with explanation. Session cookies are HttpOnly/SameSite=Strict, Secure in production; production requires an exact HTTPS origin. Every write validates session, Origin and CSRF on the server; UI hiding is not authorization. Expired sessions leave draft/source input intact and offer sign-in/retry. Rate limits and bounded request sizes apply server-side.

Owner import accepts 1–20 Markdown/ZIP uploads or a public HTTPS GitHub URL. The server validates file/archive paths, metadata, byte/file counts, UTF-8 entrypoints and package completeness before one atomic SQLite transaction. Limits: 10MB raw multipart files, 256 aggregate package files, 25MB expanded, 2MB/file. Unsafe ZIP paths/symlinks/encryption/bombs, unsupported GitHub hosts/redirects, malformed fields and duplicates receive explicit text errors. Imported scripts remain inert throughout storage/preview/export. Fixed GitHub API/raw origins, immutable commit and blob hashes provide provenance.

Failure preserves files/URL/editor input for correction; errors are associated with affected fields and keyboard focus returns for correction. Canceling an in-flight browser operation must not claim rollback of a possibly completed server transaction: reload the catalog before retrying an uncertain import. Successful imports update the canonical library immediately and remain visible in a fresh browser. Upstream-managed and owner-imported namespaces cannot overwrite each other.

## Editing, removal and legacy recovery

Only authenticated owner-managed `user:` packages can be edited/removed. Source editors retain all other files, require valid frontmatter and preserve slug identity. Renaming requires a new import. Saving supplies the prior numeric revision; stale edits fail without overwriting current DB content. Successful save replaces the source/tree and clears dirty state; errors preserve the draft.

Dirty close offers Keep editing / Discard changes; document navigation uses the narrow beforeunload protection. Removal uses an app-owned confirmation naming the package. Cancel retains it; confirmed deletion uses the revision, removes selection and persists after reload. Closing/destructive controls are disabled during writes. Managed upstream packages expose no editing affordances and the server also rejects such writes.

Browser-local imports are never silently discarded. Recover browser imports explicitly reads the previous IndexedDB store, previews recovered entries, permits a backup ZIP for every visitor, and allows the authenticated owner to migrate a validated batch into SQLite. Migration does not automatically erase the local originals. Source provenance and binary/supporting bytes survive recovery.

## Accessibility, layout and verification

Native semantic controls, explicit labels, visible focus, status/alert announcements and native dialog focus containment are mandatory. Escape and focus restoration work. Dialogs stay within viewport; long source/path text never expands page width. Small screens stack library/archive. Reduced motion and forced colors follow shared runtime styles. No meaning or action is hover-only; no browser alert/confirm/prompt is used.

`tests/redesign-browser.cjs` owns current real-browser public and owner workflows; `tests/toolkit-browser.cjs` remains its compatible entrypoint. Owner tests require a privately supplied local fixture and are explicitly skipped when unavailable. `tests/backend*.test.ts` and existing archive/harness/catalog tests own security, transactions, persistence, exact file bytes and stale writes. `scripts/measure-portfolio.cjs` records actual axe/Lighthouse/screenshots. See `docs/redesign-verification.md`; static audits never establish browser correctness.

## Public project exploration

The owner's 2026-10-23 request adds a browser-style project viewer. `components/common/Modal.tsx` owns public project/scheduling native-dialog focus placement, inert background, Escape, backdrop dismissal, scroll lock and trigger-focus restoration. Existing Lab dialogs retain `ToolkitPrimitives.Dialog` because their dirty/edit/write guards are a separate product workflow.

Project gallery previews are semantic buttons; independently available external destination links work without JavaScript. Complete descriptions/stacks remain in SSR native disclosures. Only the fixed, researched `embed` URLs in `lib/portfolio.ts` may load an iframe, and only after opening that project. GitHub and FrameVault use an overview and direct external links, respecting their framing restrictions. The readonly address represents the project destination; this is not a general-purpose browser or arbitrary URL proxy. External browsing and authentication happen on the original site.

Project preview failure/recovery must preserve title, close, overview and external-open controls. An iframe load event must never be presented as proof of successful remote content. No project iframe or external request loads on initial homepage render. No background polling or runtime GitHub dependency is added.

## Upload discovery refinement

The owner's full-photo/scroll/upload follow-up authorizes a visible upload entry for every visitor without changing write authorization. `Upload skills` lists supported formats and the current owner-access state beside the library. Signed-out activation opens `OwnerAccess` and successful sign-in continues straight into `ImportSkills`' actual file picker. Direct `Owner sign in` remains available without opening the upload form automatically. Cancel clears the pending upload intent. Unconfigured deployments explain setup and link to the operations guide; session-check failure offers retry. Server Origin/session/CSRF validation remains authoritative.

## Category folders and public source links

The owner’s 2026-10-26 request makes category folders the default unfiltered view. Opening a folder applies the server category filter and resets page 1. Search spans every folder when category is All; native category selection, URL restoration and pagination retain their existing semantics. Selection survives folder/query/page changes; Select all shown applies only to visible skill cards. The display taxonomy normalizes known labels and infers absent categories from skill slugs, with a General fallback and preservation of explicit custom categories. It never rewrites entrypoint Markdown.

Activating a skill card or its title copies `https://sujanshrestha.ca/lab/skills/{slug}/skills.md`. Owner packages use an explicit encoded `user:` namespace so same-slug imports cannot change another package’s URL. Copying leaves ZIP selection untouched. Checkboxes, Preview and Raw Markdown links remain separately keyboard-accessible. Clipboard denial preserves a focused selectable URL in shared inline Feedback. Raw source links are also real anchors for agents/crawlers.

The public source route returns exact stored UTF-8 SKILL.md contents with text/markdown, no page shell, no authentication, public CORS and no-store caching. Missing or invalid slugs give plain 404s; unavailable storage gives a plain 503 without internals. Vercel rewrites these main-domain paths to the existing persistent Railway Lab. No database migration is needed.

Lab backdrop click and Escape call the canonical guarded onClose callback. Both respect closeDisabled during writes. Dirty editors still offer Keep editing / Discard changes. Body scrolling is locked while open and restored on close together with trigger focus. Background blur comes from the shared runtime token; dialog content remains clear.
