# Skills Toolkit verification

The toolkit is served at `/lab/codex`. The portfolio navigation and footer include a discreet Lab link, and the route appears in the sitemap. Existing portfolio and blog layouts retain their original components and theme.

## Reproduce the checks

Run the normal repository checks (`pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build`). The core suite verifies all harness archive paths and import validation without needing a browser.

For end-to-end acceptance, start `pnpm dev` separately, then run:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright node tests/toolkit-browser.cjs
```

The standalone runner uses host-provided Playwright, Chromium, and Python's standard `zipfile` module. It does not add browser packages to the application. Set `TOOLKIT_LIVE_GITHUB=1` to also test a real public GitHub import; this requires access to `api.github.com` and `raw.githubusercontent.com`. The runner honors inherited HTTP(S) proxies while bypassing only localhost, 127.0.0.1, and IPv6 loopback for the local test server. It uses Playwright’s supported `PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK=1` setting so Playwright does not override those explicit local rules; external requests continue through the session proxy. The browser uses its existing trusted certificates with TLS verification enabled. If the host has no legacy Chromium NSS database, `TOOLKIT_CHROMIUM_CA_DIR=/usr/local/share/ca-certificates` can import configured local trust roots into an ephemeral NSS database using host `certutil` and `XDG_DATA_HOME`. The runner refuses to change an existing legacy trust database. On this managed host, the standard browser trust store already includes the configured environment proxy CA; its public certificate fingerprint was verified against the configured CA file. No trust entries were added or removed. No certificate values or credentials are saved in this repository. Optional settings: `CHROMIUM_PATH`, `TOOLKIT_BASE_URL` (default `http://localhost:3000`), and `TOOLKIT_ARTIFACTS` (default `/workspace/qa-artifacts`). It creates an isolated browser context, creates and deletes temporary local import fixtures, and writes screenshots and downloaded ZIPs outside the checkout.

The browser run verifies:

- The ten real source packages load; selecting five preserves that selection when changing harnesses.
- Every harness downloads a valid archive with exactly the selected package paths, no enclosing directory, and every original supporting file byte preserved. An independent Python ZIP reader checks entries, CRC integrity, and original bytes.
- Full original Markdown is previewable. Search, empty search results, reset, and category filtering work.
- Prompts distinguish intended installation destinations from user-confirmed installed paths. Changing harness resets the confirmation. Codex Web opens through its ordinary URL, and other harnesses have no invented deep link. Clipboard denial explains manual copying.
- Invalid YAML, a real traversal ZIP, more than 20 files in one upload batch, and aggregate uploads above 10 MB produce visible errors without altering existing library or storage records. Local Markdown imports persist; edits and removal survive reload. Imported HTML and scripts remain inert text/data.
- Complete ZIP packages retain binary assets, reference files, and scripts. Local export works offline.
- GitHub network failure gives a clear fallback. Only this failure path is simulated; the archive downloads, imports, IndexedDB persistence, and user interactions are real. With `TOOLKIT_LIVE_GITHUB=1`, a real public `self-eval` skill folder is imported, persisted, and exported; its commit-pinned source bytes are independently compared using curl and Python.
- At 390 pixels, the page has no document-level horizontal overflow. Mobile navigation is removed from focus order when closed, Escape closes it and returns focus, and keyboard focus is visible, and the native harness selector works by keyboard. The sibling blog route still renders.
- Corrupt IndexedDB records cause visible recovery guidance rather than being silently discarded.
- Conflicting edits from a second tab cannot overwrite a newer saved version.
- Valid imported 64-character unbroken names and 200-character unbroken categories stay within 390-pixel cards and dialogs. Close/removal controls remain reachable, while the source preview retains every original byte.

## Security review

Imported instructions are displayed as React text in a native modal, never inserted as HTML. Import and archive generation use byte operations; supporting scripts are never evaluated. GitHub URLs are limited to public HTTPS GitHub repositories/folders and resolved to commit-pinned raw files, with credentials omitted and redirects rejected. Import budgets bound request count, file count, compressed and decompressed size, individual files, and persisted collection size.

The ZIP reader checks central/local headers, compression method, CRC, declared sizes, entry overlap, path traversal, absolute paths, case collisions, nested skill roots, symlinks, and special files. Persistent records are reparsed before use, writes are atomic, and conflicting tab edits are rejected. Harness export preserves original instructions and metadata, and shows compatibility/dependency warnings rather than silently transforming content.

Runtime dependency detection is advisory. Users still review imported instructions and scripts before installing or running them in an AI coding environment. Browser storage is local to the browser and is not a substitute for a backup ZIP.

## Verification result

All 58 unit tests passed. The final production build passed all 14 grouped Chromium acceptance checks with no uncaught browser exceptions, including the real public GitHub folder import and the narrow long-content regression. Independent Python ZIP checks verified exact entry paths and original supporting bytes for all four harnesses. Screenshots, downloaded archives, and the machine-readable grouped results are in `/workspace/qa-artifacts/production` for the implementation review. No repository production files were modified by the browser checks.
