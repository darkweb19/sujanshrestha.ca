# Skills Toolkit interaction contract

Scope: `/lab/codex` is a browser-local developer tool. Existing portfolio navigation and footer retain their established ownership. English is the supported product language. Imported text and paths preserve Unicode; locale-specific forms and dates are not part of this workflow.

## Canonical UI map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Card selection | `SkillsToolkit.tsx` selected IDs | This contract | Individual, all filtered, clear all | Browser selection and archive flows |
| Select/Listbox | Native `select`, shared scoped form styling | DESIGN.md + this contract | Harness, category, package file | Keyboard/native popup, browser selection |
| Form | `ImportSkills.tsx`, `SkillPreview.tsx`, `PromptLauncher.tsx` | Package validation module + this contract | Import, edit, task prompt | Invalid input, retained values, edit/save |
| Scrollbar | `app/globals.css` | DESIGN.md / shared runtime tokens | Page, source, archive, dialog overflow | Narrow viewport overflow and computed style |
| Feedback | `ToolkitPrimitives.tsx` Feedback | This contract | Persistent status, alert | Import, download, copy, storage failure |
| Dialog | `ToolkitPrimitives.tsx` Dialog | This contract | Import, full source/edit, removal | Focus containment, Escape, return focus |
| CRUD | `storage.ts` + toolkit import/editor/removal flow | SkillPackage validation + IndexedDB transaction | Imported packages only | Refresh persistence, edit, confirm/remove |

The product explicitly accepts operating-system select popup geometry and keyboard behavior. No custom combobox or separate notification provider is necessary for this route. Feedback is inline rather than transient so failures remain actionable.

## Selection and archive

Initial selection is empty. Search matches name, slug, description, category, and source label. Category and search combine. Search clear restores focus to the search input. Zero results explains how to reset filters. Selection is independent of filtering, so hidden selected items still appear in the archive and count.

Select all chooses all currently shown items and retains prior hidden selections; its label becomes “Select all shown” when filtered. Clear selection clears the whole set. Selecting or editing packages and changing harness resets installation confirmation. The selected set, target harness, file count, and directory tree update together. A tree folder disclosure exposes every available supporting-file path. Built-in file manifests keep this complete before lazy source content loads.

Download uses only selected packages. It hydrates built-in source, performs package/selection/harness validation, and generates the ZIP in the browser. Validation errors block export; compatibility warnings remain visible and no source metadata or instructions are silently removed. The selected set and harness are frozen while an export is pending. On failure the selection remains intact, an error explains recovery, and another download attempt retries hydration. The resulting archive places the adapter's `.agents`, `.claude`, `.cursor`, or `.github` directory at its root. Download feedback never claims installation.

## Import and storage

Import accepts Markdown files, complete ZIP skill packages, and public GitHub URLs. Metadata and all paths are validated before storage. Limits, duplicate skill slugs, unsafe paths, invalid frontmatter, unavailable supporting files, and network/API failures receive explicit feedback. ZIP imports retain files inside each discovered skill folder; unrelated repository-level files are excluded. No imported script executes during import, preview, storage, or export.

Local batches are checked before reading: at most 20 uploads and 10 MB combined input. Each parsed source is checked against the aggregate 25 MB unpacked / 256 package-file limit and duplicate folders before another source is processed. New imports save atomically only after the complete batch validates, then join the library. Duplicate slugs are rejected rather than overwriting a built-in or previously imported package. The modal retains chosen files and URL on failure. Its alert is associated with the affected field using `aria-describedby`/`aria-invalid`; focus returns to that field for correction. Pending GitHub fetches expose Cancel import and abort when the modal closes. Imports remain in IndexedDB on the same browser/origin. Storage initialization failure leaves the built-in library usable, disables import, and offers Retry browser storage; it does not represent unread imports as missing or overwrite them.

Source labels, complete raw text, all filenames, source links when present, and file counts are available in preview. Binary supporting files are retained and identified explicitly. An external source link is limited to HTTPS GitHub or raw GitHub hosts. React renders source as escaped text.

## Editing and removal

Only imported packages can be edited or removed. The source dialog supports editing any UTF-8 package file while retaining other text/binary files. YAML frontmatter must stay valid and its `name` slug stays unchanged when editing. A new slug requires importing a separate package; do not infer a rename operation. Save validates and updates storage using the prior import timestamp for stale-tab conflict protection. Failures preserve the draft. Success updates the canonical package and tree and clears the dirty comparison.

While saving, closing/discard/removal actions are disabled. Closing a dirty editor shows app-owned Discard changes / Keep editing controls. Navigating away with unsaved changes invokes the browser's beforeunload data-protection mechanism. Removing a package requires an app-owned confirmation and an explicit Remove skill action; failure leaves the package present and retryable. Success removes its selection and persisted entry. A browser refresh must reflect saved imports and removals.

## Prompt workflow

The user supplies task requirements, selects skills and a harness, then generates an editable prompt. Task requirements are required and a missing task receives a focused error. Skill references derive only from adapter `skillRoot`, never repeated hardcoded path maps in UI components. Until the user explicitly confirms installation in the target repository, generated text states that installation must be checked/completed first. Downloading is not evidence of installation. Changing selection, task, adapter, or confirmation marks existing generated text as stale and asks the user to regenerate.

Copy prompt writes only the currently displayed editable text. Clipboard denial preserves the text and focuses it for manual copying. Open Codex Web is a plain `https://chatgpt.com/codex` link in a new tab with no prompt/installation query parameters. Other harnesses provide installation instructions and copyable prompts without invented launcher integrations.

## Accessibility and responsive behavior

All inputs have explicit labels; selection checkboxes include skill names. Counts, pending progress, and success messages are status regions; errors are alerts. Interactive elements have a shared visible focus treatment. Native modal dialogs trap keyboard focus, handle Escape via app close logic, and restore focus to their trigger on close. Removal confirmation has an equally available safe action. No browser `alert`, `confirm`, or `prompt` is used.

Source and archive panes scroll without horizontal page overflow. Long source wraps safely while preserving text. Small screens stack the work areas; dialogs fit the viewport. Reduced motion and forced colors remain supported through runtime CSS. No hover-only operation is required.

## Verification evidence

`tests/toolkit-browser.cjs` owns real-browser checks and evidence for selection, harness changes, exact ZIP downloads, import/persistence/edit/removal, prompt interaction, modal keyboard behavior, and responsive layout. `tests/archive.test.ts` and import/harness tests own package boundaries and exact generated archive paths. See `docs/skills-toolkit-ui.md` for the implementation review and actual validation report; never infer runtime success from the presence of this contract.
