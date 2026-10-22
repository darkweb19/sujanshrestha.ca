---
version: alpha
colors:
  background: "#ffffff"
  surface: "#ffffff"
  subtle: "#f5f5f5"
  primary: "#171717"
  accent: "#333333"
  text: "#171717"
  muted: "#555555"
  dim: "#666666"
typography:
  sans:
    fontFamily: "Arial, Helvetica, system-ui, sans-serif"
  mono:
    fontFamily: "SFMono-Regular, Consolas, monospace"
rounded:
  control: "8px"
  card: "12px"
  panel: "12px"
omitted:
  - section: components
    reason: "Shared component contracts are documented in prose; runtime CSS owns their token references."
spacing:
  card: "20px"
  panel: "24px"
  column: "40px"
---

# Sujan Shrestha — design context

## Overview

A personal engineering portfolio for prospective collaborators and employers, with a practical Skills Lab for developers. English, international audience; Toronto is the actual location. The current redesign brief supersedes the former coffee palette and browser-only persistence policy. Facts and published content remain unchanged; see `docs/content-baseline.md`.

The chosen direction is a personal studio folio: expressive, tightly spaced name typography, the supplied sculptural S monogram, an honest portrait, and a work index with complete project descriptions. Two alternatives and critique live in `docs/design-directions.md`. The lead selects the folio because name, real work, and chronology remain the strongest evidence of an individual engineer. Avoid decorative terminal UI, fake metrics, gradients, glass effects, repeated marketing cards and automatic reveal animations.

## Colors

`app/globals.css` is the canonical runtime source. Frontmatter records its normative palette. Mapping: background → `--color-bg-0`, surface → `--color-bg-1`, subtle → `--color-bg-2`, primary → `--color-coffee` (legacy compatibility alias), accent → `--color-espresso`, text → `--color-text-primary`, muted → `--color-text-muted`, dim → `--color-text-dim`. Legacy coffee/beige names resolve to neutral values; new components use semantic portfolio classes or text/background tokens. There is one theme for portfolio, writing, and Lab. Error text remains dark red with textual explanation. Focus is a 2px near-black outline with 4px offset.

## Typography

No runtime font requests. Arial/Helvetica/system sans provides an immediately rendered neutral grotesque with a compact bold display treatment. Utility paths/source alone use SFMono-Regular/Consolas/monospace. The wordmark is the supplied SVG, not a new text logo. H1: fluid 64–144px, -0.075em tracking, 0.94 line-height; section headings: 36–64px, -0.055em; body: 16–20px, 1.65 line-height; controls: minimum 14px. Blog prose uses a readable 72ch measure. Display type does not replace labels or hide facts.

## Layout

A 1200px maximum container uses 56px desktop and 24px mobile gutters. Header is an opaque, stable 88px row. The hero pairs name/role/actions with an inset portrait; mobile becomes a deliberate text-first composition. Selected projects are a linked index, with a quiet highlighted first project and full descriptions. Employment uses date rail + complete role content. Education uses compact reverse chronological rows, preserving overlapping ongoing programs. Writing uses a distinct article list. Section rhythm is fluid 72–128px.

At 375px: single-column name, portrait below introduction, one-column timelines and Lab panels; no horizontal page overflow. At 768px: two-column hero, dates retain a separate rail where room allows. Wide desktop: asymmetric hero and structured project index. All content exists in initial HTML; no invisible reveal states, lazy section shells, or viewport-dependent omissions.

## Elevation & Depth

Borders and neutral surfaces establish hierarchy. No decorative shadows on portfolio sections. Modal overlays alone receive shadow and a dim backdrop. The Lab archive is a working panel, not a simulated terminal.

## Shapes

8px controls, 12px panels/dialog content; portrait uses a restrained 8px crop. Projects and chronological entries are document rows. Selected controls change borders/background without affecting geometry. The monogram keeps its original proportions and ample clear space.

## Components

Shared shell: `Navbar`, `Footer`, global `.section-container`, `.portfolio-section`, `.section-heading`, `.action`. Portfolio sections are Server Components; mobile navigation, copy-email and scheduling are small client islands. `ToolkitPrimitives.tsx` owns Lab Button/Feedback/Dialog. Native selects intentionally accept OS popup geometry and keyboard semantics. Native modal dialogs own focus containment; close restores focus.

Lab data comes from SQLite through server queries and API handlers; public users browse/export, authenticated owner actions persist changes. See `UX-CONTRACT.md` for behavior and `docs/railway-sqlite.md` for permissions and persistence. Imported text is displayed as text, and script assets remain inert.

## Motion

Only short interaction color/opacity transitions; no scroll-linked effects. Reduced-motion disables smooth scrolling and transitions. Global scrollbars are visible, tokenized and forced-colors compatible. Stable image aspect ratios, explicit sizes, and system fonts avoid layout shifts.

## Do's and Don'ts

- Preserve every role, date, institution, technology, project description and destination.
- Keep whole project descriptions visible and genuine content in SSR HTML.
- Prefer direct labels and honest states over decorative metrics and claims.
- Keep dark text on light surfaces; make keyboard focus at least as clear as hover.
- Never execute uploaded/imported scripts or expose admin credentials to the client.
- Do not deploy or alter production infrastructure as part of this branch work.
