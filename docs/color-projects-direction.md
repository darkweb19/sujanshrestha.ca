# Color and project exploration

The owner's 2026-10-23 request authorizes a colorful homepage, less visible prose, more creative project exploration, additional verified GitHub projects, browser-style modals with a blurred backdrop, optional animation, and at least ten focused commits pushed to `feat/redesign`. This supersedes the original brief's monochrome preference and always-visible project descriptions. No merge or deployment is authorized.

## Baseline and content contract

Starting revision: `efce3e5`. The integrated original-photo hero is accepted. Four projects, four employment records, five education records, two published articles, resume and contact destinations must survive. Original fields remain canonical in `lib/portfolio.ts`; the new presentation may use faithful summaries and native disclosures, without deleting dates, qualifications, descriptions or links. Existing screenshots and `docs/content-baseline.md` document the preceding state.

The audience is prospective collaborators/employers on mobile 4G and desktop. The home route remains indexable SSR. Target lab LCP is 2500ms, CLS below 0.1 and interaction latency below 200ms; these do not establish field p75 performance. The lead owns WCAG 2.2 AA verification with independent visual/QA review.

## Directions considered

| Direction | Composition and palette | Critique |
| --- | --- | --- |
| Color proof studio — selected | Cool white `#F5F7FC`, ink `#17233B`, cobalt `#3155E7`, lilac `#E7DEFA`, peach `#F6BD9A`, seafoam `#C8E8DF`. Integrated portrait/type; asymmetrical project windows with authentic previews and short captions. | A clear continuation of the accepted hero, with a distinctive colorful project gallery. Keep surrounding navigation and timeline controls quiet. |
| Tactile folio | Cool stone, plum, teal, melon and periwinkle; overlapping browser sheets. | Richer mood, but overlapping windows compete with the portrait and create harder mobile density/focus decisions. Rejected. |

The lead selects color proof studio. Keep the existing system sans display and body typography; monospace is reserved for browser addresses/source labels. No new font or animation dependency. Color mounts belong to projects; they do not imply unsupported status or achievements. Preserve the actual photograph in color with its silhouette crop.

## Project and overlay contract

Cards prioritize a visual, name and one purpose sentence. Every project has a working original destination without JavaScript. Enhanced preview buttons open an accessible native modal with browser chrome, inert/blurred backdrop, scroll lock, Escape, explicit close and focus restoration. Full descriptions and technologies remain in SSR disclosures and modal overviews.

Only explicitly verified hosted sites may load in sandboxed iframes, on demand after opening a project. GitHub and FrameVault prohibit framing: use an honest repository/project overview with authentic media and a direct external link. Never proxy third-party pages or claim a blocked embed loaded. Cross-origin `load` does not establish successful rendering. Keep an external fallback and bounded loading/retry state available. No iframe loads on initial home render.

Motion consists of the accepted hero entrance, small project hover movement and a brief dialog entrance. All meaning and actions remain available without motion, hover or JavaScript.

## Planned reviewable commits

1. Record this direction and preservation contract.
2. Add verified GitHub project records and provenance.
3. Establish color tokens and durable design mapping.
4. Apply color to the accepted hero composition.
5. Make biography and career details progressively readable.
6. Compact education, writing and contact presentation.
7. Build visual project gallery and original destination links.
8. Share native overlay focus/scroll behavior.
9. Add browser-style project exploration.
10. Add bounded preview recovery and motion polish.
11. Verify project interactions with meaningful browser coverage.
12. Publish final screenshots and measured acceptance evidence.

Final evidence and any corrections will be recorded after implementation and independent review.
