# Portfolio polish — 2026-11-06

Baseline: main at `e351e8b`. Branch: `feat/portfolio-visual-polish`.

The current request is a polish pass across home, writing, article readers, project
and scheduling dialogs, and Skills Lab. It preserves the established photographic
hero, cool-white/cobalt/ink palette, system typography, real content, links,
SQLite/API/import/export behavior and light-only appearance. No new theme,
animation library, backend feature, merge or deployment is part of this task.

Both requested public ui-design-system and ux-researcher-designer Markdown skills
were fetched and read. Their token, responsive and usability-check guidance
informs the implementation; engineering observations are not user interviews.
Luna (Max) owns navigation/mobile polish. Terra (Max) owns Lab controls/dialogs.
The lead owns visual direction, shared CSS, public content and final review.

## Direction and preservation

Two approaches were considered: add more decorative depth/motion, or refine the
existing surfaces with complete interaction states and clearer reading rhythm.
The second is selected. Keep the recognisable monogram, photograph and asymmetric
project windows; remove normal-heading blur that does not aid reading. Retain
contrast treatment where the photograph needs it. Use 160/200ms CSS transitions,
keyboard-visible states, stable borders and no transforms that move page layout.

Public pages remain SSR/SSG and all facts remain available in native disclosures.
Preserve `lib/portfolio.ts`, blog Markdown, resume and brand/media bytes unchanged.
Their baseline SHA-256 values are recorded in ignored work/polish/content-hashes.txt. A verified status-only exception removes the obsolete YouTube blocked-preview notice after the live app allowed the canonical portfolio origin; all factual fields remain byte-for-byte unchanged.
The audience is international English, mobile/4G and desktop; target WCAG 2.2 AA,
LCP <=2500ms / INP <=200ms / CLS <=0.1 at field p75. Lab tests are synthetic,
not a claim of field compliance. Lead owns accessibility sign-off. Avoid initial
JS transfer growth; measure actual before/after rather than inventing a score.

## Verification

Check visible hover, focus, pressed, disabled and busy states; link affordances;
short-screen mobile navigation; native accordion keyboard behavior; sticky-header
anchor clearance; long article/code/table wrapping; project media and modal
geometry; light appearance with both OS preferences; reduced motion and forced
colors. Verify 320/375/768/1440px and desktop 200% reflow, compare screenshots,
run axe and Lighthouse, preserve content checksums, and run lint/types/tests/build
plus existing Lab and project browser suites. At least 12 focused commits.
