# Homepage refinement: portrait and type

The owner found the initial clean folio too generic, specifically rejecting the separate rectangular right-hand portrait. The new direction preserves the neutral identity and every portfolio fact while giving the home opening a more individual composition and limited motion.

## Concepts and decision

1. **Integrated portrait and type.** The existing portrait becomes an unframed foreground silhouette between two large name lines. The surname crosses the image with a white keyline protecting its dark letterforms. Role/location, original introduction and actions remain distinct readable areas. This makes the actual person and name one composition rather than adjacent blocks.
2. **Photographic editorial opening.** A full-width desaturated source photograph with typography at its edges. This retains more environmental context, but the busy original background makes text contrast and mobile cropping harder to control.

The lead selected the first direction after independent visual/accessibility critique. The original source photo is used directly with a CSS silhouette crop. An experimental generated cutout was rejected during independent review because it reconstructed facial and fabric detail. No generated portrait is shipped.

## Responsive and motion contract

Desktop layers the portrait, first name and outlined surname on a shared canvas. Tablet keeps the composition with less scale and moves controls into a clean subsequent row. Mobile positions the portrait between the name lines, with summary/actions in normal flow; there is no mandatory full-screen height or tiny scaled desktop card.

One short transform-only entrance introduces the canvas. Fine-pointer devices get at most 8px/5px of portrait movement; pointer work pauses offscreen and is removed for reduced motion. Content remains rendered and visible without JavaScript. No custom cursor, marquee, badge animation, scroll hijacking or animation library is introduced.

## Verification and lead review

Validated against the production Next.js build on 2026-10-22:

- `npm run lint`, `npm test` (74 passed), and `npm run build` passed. Design token lint reported no errors/warnings; premium strict audit reported no findings.
- The existing public browser suite passed all eight groups: five routes, keyboard navigation, no-JavaScript facts, catalog security, all four ZIP formats, preview, search/reload and mobile navigation. Authenticated owner upload tests were not rerun for this presentation-only change; the public server has owner access disabled.
- Additional browser checks covered 320/375/640/641/720/768/1024/1440px: no horizontal overflow, full name bounds fit, original CV target retained, schedule dialog opens from keyboard and restores focus after Escape. Entrance finishes once; pointer movement stays within 8px/5px; changing reduced-motion preference resets movement and removes animation.
- Axe reported zero WCAG A/AA violations at 375/768/1440px. Manual review corrected blended surname contrast with a white keyline, rejected a generated portrait that reconstructed facial details, tightened the original-photo silhouette, and fixed the mobile location wrap.
- One local mobile Lighthouse run scored performance/accessibility/best-practices/SEO **100/100/100/100**, with LCP **1.7s**, CLS **0**, and total blocking time **40ms**. These are synthetic local observations, not field Core Web Vitals or a compliance certification.

Lead sign-off: the portrait and name now share an unframed composition, the source face remains authentic, and the featured-work section gives the homepage a distinct second movement. All original biography, project facts, routes and actions remain available. No production deployment or main-branch merge is part of this update.

## Review images

- [Desktop hero](screenshots/home-desktop.png), [tablet hero](screenshots/home-tablet.png), [mobile hero](screenshots/home-mobile.png)
- [Desktop work section](screenshots/home-work-desktop.png), [mobile work section](screenshots/home-work-mobile.png)

Raw browser and measurement output is available in the ignored workspace directories `qa-artifacts/homepage-refinement-public` and `qa-artifacts/homepage-refinement-measurements`.
