# Colorful homepage and project exploration — verification

The owner requested color, less visible prose, two additional GitHub projects, creative project previews in a browser-style modal, a blurred backdrop, animation, and at least ten commits pushed to `feat/redesign`. [Direction and preservation contract](color-projects-direction.md); [immutable project sources](project-provenance.md).

## Delivered behavior

- Cobalt/cool-white hero with the original color photograph; lilac, peach and seafoam project mounts; peach contact and seafoam education sections. The accepted unframed portrait/type composition remains.
- Approximately 390 words visible in the initial main-page reading flow. Full biography, career highlights, technologies, academic descriptions and project descriptions remain in native SSR disclosures. All 86 original data fields across employment, projects and education match `efce3e5` exactly.
- Six projects: ATSResumie, FrameVault (Video Automation), YouTube Extractor in Rust, Outpost, DraftForge and NeverComes. Real hosted-site screenshots are distinguished from authored workflow illustrations.
- Native project dialog with browser chrome, read-only destination, dim/blurred backdrop, bounded body scrolling, explicit close, Escape, keyboard containment, focus restoration and preserved page scroll. Scheduling reuses the same public overlay behavior.
- Only ATSResumie/NeverComes are configured live iframe candidates. Full details and external destinations remain available; GitHub and FrameVault deliberately use overviews because their response headers prohibit embedding. No third-party page is proxied. The iframe is created only after an explicit preview open and is removed on close or overview navigation.
- Preview loading has an eight-second recovery message and explicit retry. An iframe `load` event never claims successful rendering. Transform-only entrances and hover straightening are brief; reduced motion removes them. Modal controls are in the initial bundle so opening does not wait for another chunk.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm test` | 74 passed, zero failed/skipped |
| `npm run typecheck` and final production build | Passed |
| Official `@google/design.md` token lint | Zero errors/warnings; 11 colors, six radius levels |
| `node tests/redesign-browser.cjs` | Eight public groups passed: five routes, metadata, keyboard, no-JS content, catalog authorization/search, exact four-harness archives, preview, navigation and reload state |
| `node tests/projects-browser.cjs` | Five groups passed: all six modals; native keyboard/focus/scroll; deterministic live-frame boundary; slow/blocked/retry states; responsive bounds; reduced/default motion; backdrop/scheduling; original links and native disclosures without JS |
| Homepage axe states | Zero WCAG A/AA violations in home, expanded-details and project-modal states at 375/768/1440px (nine scans) |
| Shared palette route scan | Five public routes × 375/768/1440px: HTTP 200, zero overflow and zero axe violations (15 scans) |
| Responsive project viewer | 320/375/768/1440px with a short 700px viewport; no horizontal modal overflow and close/external links remain accessible |
| Independent review | Main owns sign-off. Read-only visual/accessibility review approved all nine hero/gallery/modal screenshots. Independent source comparison found zero missing/modified original fields. |

The public browser server has owner management disabled; authenticated import/edit/delete scenarios were not rerun for this homepage presentation change. Existing backend security/persistence unit tests passed. The optional premium app audit helper was unavailable after the session's cloud-skill removal; no static audit pass is claimed. Runtime browser checks and official token lint provide the recorded evidence.

## Corrections made during review

The gallery's wide browser chrome and narrow modal illustration initially clipped; their layout now fits their mounts. Contact captions initially failed contrast on peach; colored surfaces now use ink. Explicit tab-edge cycling prevents focus leaving the public dialog controls. FrameVault's image alternative correctly describes its public sign-in screen. Active-view clicks no longer reset the loading message without starting a request. The accepted original-photo crop is retained without generated facial reconstruction.

## External-preview verification boundary

Actual ATSResumie/NeverComes hosted iframe rendering could not be established in the managed Chromium session: remote navigation failed with `ERR_CERT_AUTHORITY_INVALID` before any child-page DOM rendered. The independent reviewer retained TLS verification and left the original trust store unchanged. This is an environment trust limitation, not evidence that either site prohibits framing. Their observed response headers permit them as candidates, and the application keeps an explicit overview/external fallback. Browser fixtures verify allowed, blocked and stalled frame behavior separately; they are not presented as proof of the external sites rendering.

## Performance observations

Local mobile Lighthouse, synthetic throttling; each row is one run. The priority change responds to Lighthouse's concrete missing-priority-hint finding. These are not field p75 Core Web Vitals or a WCAG certification.

| Build | Performance / accessibility / best practices / SEO | LCP | CLS | Total blocking time |
| --- | --- | --- | --- | --- |
| Initial color build | 97 / 100 / 100 / 100 | 2.6 s | 0 | 60 ms |
| Final build with explicit hero priority | 98 / 100 / 100 / 100 | 2.4 s | 0 | 90 ms |

Unthrottled production-browser home observations at 375/768/1440px recorded LCP 212/216/388ms and CLS 0. Initial JavaScript transfer was approximately 151KB. These lab observations do not establish real-user INP. Target field LCP remains 2500ms; the initial Lighthouse run at 2.6s slightly exceeded that goal, while the final run reached 2.4s after adding the image priority hint. No score is represented as a guarantee.

## Review artifacts and sign-off

- [Desktop home](screenshots/home-desktop.png), [tablet home](screenshots/home-tablet.png), [mobile home](screenshots/home-mobile.png)
- [Desktop project gallery](screenshots/home-work-desktop.png), [mobile gallery](screenshots/home-work-mobile.png)
- [Desktop project modal](screenshots/project-modal-desktop.png), [mobile modal](screenshots/project-modal-mobile.png)

Raw reports are in ignored workspace directories `qa-artifacts/color-projects`, `color-public`, `color-accessibility`, and `color-measurements`. Reproduce with a seeded nonproduction server; `TOOLKIT_BASE_URL` selects the functional test origin, `PROJECT_ARTIFACTS` selects project artifacts, and `scripts/measure-portfolio.cjs` documents performance/axe inputs. No production credentials or private application screenshots are committed.

Lead sign-off: the palette, shorter visible reading flow, six-project visual gallery and browser-style exploration satisfy the authorized update. The external iframe verification limitation is explicit. No merge, deployment, database migration or production configuration change is part of this work.
