# Portfolio redesign: concept comparison and design decision

Prepared after the content audit in `docs/content-baseline.md`, before broad display implementation. This document records creative alternatives and the recommended direction; `DESIGN.md` is the maintained implementation contract. The main thread remains the design owner and final reviewer.

## Subject, audience and task

Sujan Shrestha is a Toronto-based Full-Stack Software Engineer whose real work includes ATSResumie, Outpost, DraftForge and NeverComes. The portfolio has two registers: a professional record for people evaluating his work, and a functional Skills Lab for developers preparing coding-agent instructions. A visitor should understand who Sujan is, inspect authentic work and chronology, and reach his resume/contact channels. A Lab visitor should browse trusted packages, preview complete files and export precisely the selected skills. Owner-only import management must be explicit.

No audience research or usability interviews were supplied. Recruiter, engineering peer and prospective collaborator are reasoned audience hypotheses from the content, not research findings. English is the established language. There is no evidence of Japan-market requirements.

## Concept A: Personal studio / work index

A generous, left-aligned personal masthead sets Sujan's name in unusually large, tightly controlled sans-serif type. A small authentic portrait occupies a quieter right-hand area. The supplied sculptural S appears at navigation size, with a restrained wordmark or adjacent accessible name; it is never an ambient watermark. Below the introduction, a spacious project index is the signature: each project receives its own full-width typographic row, with title, complete description, technology list and a clearly named destination. It reads as a body of work rather than four generic cards.

The professional record uses two related but distinct compositions: employment aligns date rails against full role/company descriptions, while education becomes a compact credential list with dates and institutions. Writing uses publication dates and article titles with no extra card chrome. The Lab adopts the same type, navigation, buttons and neutral surfaces, with stronger grouping only where selection/export needs it.

```text
Wide desktop
┌ S / wordmark ───── About  Work  Experience  Education  Writing  Lab ┐
│                                                                    │
│ Sujan                           small authentic portrait            │
│ Shrestha                        Toronto, CA                         │
│ Full-Stack Software Engineer                                       │
│ Existing introduction          Download CV   Schedule a call        │
│                                                                    │
├ Projects ───────────────────────────────────────────────────────────┤
│ ATSResumie             Full description + technologies     Visit    │
│ Outpost                Full description + technologies     Source   │
│ DraftForge             Full description + technologies     Source   │
│ NeverComes             Full description + technologies     Visit    │
├ About ──────────────── Existing biography / technology inventory ────┤
├ Experience ─────────── Jan 2026 – Present     Role + employer         │
│                        April 2025 – Oct 2025 Role + employer         │
├ Education ──────────── Exact dates            Institution + program  │
├ Writing ────────────── Date                   Article title          │
└ Contact                Email / GitHub / LinkedIn / resume ───────────┘
```

The signature is not the use of rules or a large headline alone. It is the deliberate mismatch of the quiet personal portrait and substantial work titles, paired with complete authentic engineering descriptions. Projects have different amounts of text and should keep that rhythm; do not force equal-height boxes. Do not fabricate screenshots or metrics to make rows look richer.

### Strengths

- Makes the supplied identity and actual project names memorable without extra ornament.
- Scans quickly while preserving every highlight, credential and date.
- A shared grid can connect portfolio, articles and the working Lab without making them visually identical.
- Server-rendered text can carry the visual identity with negligible animation cost.

### Risks and corrections

- A dense “Swiss newspaper” treatment could become another template. Keep broad whitespace, a restrained portrait and comfortable radii on genuine controls; avoid decorative index numbers, ALL-CAPS eyebrows and rules around every paragraph.
- Extremely large type could wrap awkwardly. Bound the name with fluid sizing and deliberate line breaks; keep role and actions visible at 375px without horizontal scrolling.
- The project rows could become entire paragraphs of linked text. Make the project title/destination the link and leave descriptions selectable; use a separately styled accessible focus target.

## Concept B: Engineer's folio

A compact personal identity column anchors a sequence of generous, individually art-directed project spreads. The first view shows Sujan's name and professional facts at modest scale, with ATSResumie as the leading work entry. Each spread uses authentic interface crops only if the repository supplies them; otherwise precise typography and complete descriptions carry the work. Experience and education follow as an uninterrupted professional dossier. Article pages resemble a reading folio with a narrow measure and minimal supporting navigation.

```text
Wide desktop
┌ S / wordmark ──────────────────────────────────────────────────────┐
│ Sujan Shrestha         ATSResumie                                   │
│ Software Engineer     Complete description / technologies           │
│ Toronto, CA           Real work sample, only if available            │
│                                                                    │
│ Resume / Contact      Outpost                                      │
│ About / Experience    Full spread with complete content              │
│ Education / Writing                                                │
│ Lab                   DraftForge / NeverComes                       │
├ Professional record ────────────────────────────────────────────────┤
│ Experience and education, exact dates and full descriptions           │
└ Writing / Contact ──────────────────────────────────────────────────┘
```

### Strengths

- Work becomes the immediate introduction and feels unlike a conventional hero-led portfolio.
- The persistent identity rail is useful for an evaluator moving between longer case-study spreads.
- Could support future documented project case studies without changing its visual premise.

### Risks and corrections

- No authentic project screenshots or case-study outcomes are supplied. A spread-based system would either look empty or pressure implementation to invent evidence.
- A persistent identity rail consumes too much width at tablet sizes and adds navigation complexity for this relatively short professional record.
- Leading with a single featured product can obscure the role, biography and other three projects.
- The Lab would need a different column model, weakening the visual continuity unless more shared primitives were introduced.

## Decision: recommend Concept A

Choose the **personal studio / work index** direction. It uses what the repository actually has: a distinctive S, one authentic portrait, a clear identity, four strong text-rich projects, substantial professional chronology and two technical articles. Concept B is more dependent on media and case-study material that does not exist. Concept A gives a complete redesign without manufacturing evidence or limiting the Lab.

This recommendation matches the lead's proposed personal masthead and work-index direction. The lead should carry the selected rationale into `DESIGN.md`, adapt the precise tokens there, and independently critique browser screenshots before final acceptance. Do not preserve the old coffee palette or full-screen portrait fade merely because earlier session documents mention them; the current brief explicitly supersedes that identity.

## Proposed token system

`app/globals.css` should remain the single runtime owner. `DESIGN.md` records decisions and maps tokens; feature CSS consumes semantic variables rather than copying colors. These are proposals until the lead reconciles the implemented system.

| Token role | Proposal | Reason |
| --- | --- | --- |
| Canvas | `#ffffff` | Clear neutral field, no cream cast |
| Secondary surface | `#f5f5f5` | Separates the Lab controls and quiet supporting content |
| Primary text / primary action | `#101010` | Matches the supplied black monogram |
| Body / muted text | `#555555` | Readable hierarchy on white and light gray |
| Secondary text | `#666666` | Useful metadata while preserving AA contrast on white |
| Border | `#dedede` | Structural separators, never the only selected/focus signal |
| Focus | `#2459c4` | Deliberate semantic keyboard signal, absent from decorative content |
| Error | `#a02323` | Text + explicit error language, not color alone |
| Success | `#22613d` | Text + explicit successful outcome |

Use a system sans stack led by `-apple-system`, `BlinkMacSystemFont`, `Helvetica Neue`, Arial and sans-serif. No Google Fonts dependency for the portfolio. Body sizes 16–18px with 1.55–1.7 line height; project descriptions stay under 70 characters per line. The masthead can grow from approximately 56px at 375px to 120px on wide desktop, with optical spacing checked at every breakpoint. Use monospace only for literal file paths, source code and archive trees, never for every tiny label.

Spacing derives from 4/8px increments. Container maximum approximately 1200px; desktop gutters 48px, tablet 32px, mobile 20px. Section gaps approximately 120/88/64px by viewport. Controls have 8px radii; genuine panels 12–16px; imagery may use a controlled larger radius. No shadows on the project index. Modal elevation is the strongest elevation. Text content is never clipped to make cells align.

## Responsive states

### 375px

- Navigation shows the monogram/name and one menu trigger with at least a 44px target. Open links fit the viewport and Escape returns focus to the trigger.
- Masthead has deliberate line breaks; role, location, resume and scheduling remain before unrelated content. Portrait becomes a compact supporting image, not a full-height background.
- Project titles, descriptions and technology text stack. Full descriptions remain visible. Employer and institution names wrap naturally; dates remain attached to their entries.
- The Lab library precedes the selected archive/export region in source order. A clear count and jump affordance may help, but fixed controls must not obscure content. Dialogs scroll internally with reachable actions.

### 768px

- Keep ample gutters and readable line measure; do not squeeze a full desktop nav or a 352px Lab sidebar into unusable columns.
- Masthead can become an asymmetric two-column composition with portrait, provided names/role never clip.
- Date rails can align beside experience/education if content has sufficient width; otherwise use the stacked mobile model.

### Wide desktop

- Use bounded content, not viewport-width paragraphs. Projects get generous horizontal composition; long employment highlights remain constrained to a readable text column.
- Lab catalog and archive use two columns only when the catalog remains usable. Avoid nested competing page scroll regions.

## Accessibility and behavior critique

1. The old portfolio relies heavily on opacity-zero Framer reveals. All factual content should be visible in initial server HTML and remain legible with JavaScript disabled or reduced motion enabled. Replace scroll reveals with static content, reserving motion for short user actions.
2. Provide a skip link to the single main landmark. Maintain one meaningful h1 per route and a sequential heading hierarchy: section h2, role/project h3.
3. The old floating nav changes visibility while scrolling and has small mobile controls. Prefer steady navigation or fully restore it on keyboard focus; measure target sizes and ensure hash targets clear sticky chrome.
4. Keep project descriptions complete; existing `line-clamp-3` obscures relevant source claims. Do not preserve that truncation.
5. Avoid communicating active employment or selected skills through dots/color alone. Existing dates and explicit “Present”/selected counts supply the text signal.
6. Keep direct email and scheduling destinations available when clipboard or third-party embedding fails. Any modal must make the background inert, trap focus, close via Escape and restore focus; an iframe alone cannot guarantee third-party keyboard behavior.
7. Catalog loading/error/empty/no-results and import busy/success/failure states must retain stable geometry and accessible status. Search clearing must restore focus. Public read-only and owner management affordances should be unambiguous.
8. Admin credentials are sensitive values: masked inputs, no browser persistent storage, server authorization and CSRF enforcement. Editing/deletion applies only to owner-imported packages; upstream packages remain managed.
9. Preserve visible, operable global scrollbars. Match text contrast on every actual surface; the chosen muted palette is a proposal, not measured compliance.
10. Verify focus, navigation, the complete four-harness export path and owner import persistence with a real browser at 375px/768px/wide widths and 200% zoom. Aesthetic review alone cannot establish WCAG conformance.

## Evidence required before acceptance

Compare the implementation against the frozen ledger and route list; capture desktop, tablet and narrow screenshots; inspect the real open menu/dialog and catalog selection; test keyboard and reduced motion; run project checks and actual Lighthouse measurements. Report measured outcomes and operational prerequisites honestly. No production infrastructure change or deployment is authorized by this design decision.
