# Full-photo hero, restrained sections, smooth scrolling and upload discovery

The owner's follow-up requests the original full image as the hero background with a gradient blur, quieter Academics/Contact surfaces, smooth scrolling, a discoverable database upload field, fast performance and exactly three commits on `feat/redesign`.

## Result and design review

The full-width original photograph replaces the silhouette crop and pointer island. The name/copy sit below the face with a dark directional scrim and white focus states. A static lower blur is bounded to 128px desktop/96px mobile; no full-screen animated filter or image reconstruction. The responsive priority image uses quality 50 under the dark veil, with WebP to avoid slow first-request AVIF encoding. Other optimized images retain quality 75. The project's actual photo file is unchanged.

Two directions were compared: full-width dark photography (selected) and a light background with a contained original photo (rejected as another separate image block). Independent visual review approved desktop/tablet/mobile without clipping. Academics now uses cool-white; Contact uses ink and light text. Project colors remain in the gallery. Every original career, academic and project record remains unchanged.

`SmoothScroll` is a homepage-only progressive enhancement with no dependency, transformed document wrapper or idle animation loop. Coarse wheel input eases on one requestAnimationFrame loop until settled. Floating-point position avoids rounding stalls. Noncancelable events immediately stop easing so native scrolling cannot compete with an old target. Small/fractional wheel input, touch, keyboard, horizontal gestures, zoom modifiers, editable fields, nested scrollers and dialogs retain native behavior. Reduced motion removes the wheel listener; pointer/keyboard/touch/click/resize/visibility changes cancel active motion. Hardware classification is heuristic: a large integer-pixel trackpad event can be treated as coarse input.

## Upload field and database

The file input already existed in `ImportSkills`, but its entry was hidden until authentication. The visible **Upload skills** button now explains accepted Markdown/ZIP and GitHub sources, shows owner-access status, and continues directly from owner sign-in into the actual file picker. Cancel clears that intent. Session-check failure offers retry; unconfigured deployments explain setup and link to [operations instructions](railway-sqlite.md#upload-skills-from-the-lab).

No database permissions were relaxed. Existing server session, exact Origin, CSRF, rate limits, archive validation and transaction rules remain authoritative. Owner browser verification used an isolated SQLite backup and ignored local fixture credentials, never production secrets. Markdown/ZIP uploads, exact supporting binary bytes, inert scripts, editing, cross-browser reload persistence and removal all passed; fixtures were cleaned up by the suite.

The local public production server has owner configuration disabled. A read-only check of `https://sujanshrestha.ca/api/lab/session` returned **404**, not session JSON. No production configuration is inferred. The live Lab must serve the branch's API at its public origin and have owner settings/persistent SQLite configured before live uploads can work. No production routing, secrets, merge or deployment was changed.

## Verification

| Check | Evidence |
| --- | --- |
| Lint and TypeScript | `npm run lint`, `npm run typecheck` and production build passed |
| Unit/backend tests | `npm test`: 74 passed, zero failed/skipped |
| Complete owner browser suite | Twelve groups passed, none skipped; includes visible upload → sign-in → file field, actual Markdown/ZIP save/edit/cross-browser persistence, CSRF/SSRF protections and removal |
| Smooth scrolling | `node tests/scroll-browser.cjs` passed coarse easing/settle, no idle RAF, noncancelable cancellation, precise/horizontal/zoom gestures, reduced motion, keyboard/touch, nested panels, dialogs and document edges |
| Unconfigured/error UI | Browser check passed visible upload entry, setup guidance, disabled unauthenticated field, session failure/retry, focus return and narrow layout |
| Accessibility | Five public routes × 375/768/1440px: zero axe WCAG A/AA violations, zero overflow, HTTP 200. Unconfigured owner dialog also had zero axe violations |
| Design context | Official `@google/design.md` lint: zero errors/warnings |
| Assets/dependencies | No new runtime dependency, generated portrait, secret or SQLite file committed |

Owner workflows ran on a configured **nonproduction development server** so local HTTP fixture authentication does not weaken production HTTPS requirements. Public layout/performance checks ran against the production build. The optional premium static helper was unavailable after cloud skills were removed in-session; no pass is claimed for that unavailable helper.

Raw reports remain in ignored `qa-artifacts/refinement-owner` and `qa-artifacts/photo-refinement-measurements`; the scroll acceptance script is checked in. These are synthetic browser observations, not field p75 Core Web Vitals or a compliance certification.

## Performance observations

Each row is one local synthetic mobile Lighthouse run, not a field guarantee. The initial run exposed a slow image load/render path; the final build uses smaller WebP background output, removes the image saturation filter and reduces the static blur area.

| Build | Performance / accessibility / best practices / SEO | LCP | CLS | Total blocking time | Speed index |
| --- | --- | --- | --- | --- | --- |
| Initial photographic build | 88 / 100 / 100 / 100 | 3.2 s | 0 | 200 ms | 3.9 s |
| Optimized final build | 96 / 100 / 100 / 100 | 2.8 s | 0 | 50 ms | 1.0 s |

The final run meets the ≥95 Lighthouse target. Its synthetic LCP at 2.8s still exceeds the 2.5s LCP goal; production field performance remains unmeasured. The final image's observed load/render phases were approximately 202ms/44ms, compared with 846ms/1331ms initially. Initial JS transfer remained approximately 151KB (budget 180KB); no new package was added. Unthrottled home observations at 375/768/1440px recorded LCP 236/196/268ms and CLS 0. The scroll acceptance test verifies the animation stops at idle; these observations do not establish real-user INP.

## Review images

- [Desktop hero](screenshots/home-desktop.png), [tablet hero](screenshots/home-tablet.png), [mobile hero](screenshots/home-mobile.png)
- [Academics](screenshots/academics-desktop.png), [mobile Academics](screenshots/academics-mobile.png)
- [Contact](screenshots/contact-desktop.png), [mobile Contact](screenshots/contact-mobile.png)
- [Lab upload entry](screenshots/lab-desktop.png), [mobile Lab](screenshots/lab-mobile.png)
- [Authenticated file field](screenshots/skills-upload-desktop.png), [mobile file field](screenshots/skills-upload-mobile.png)

Lead sign-off covers the photographic composition, quieter lower sections, tested native-input exceptions and secure upload discovery. The live API deployment prerequisite is explicit.
