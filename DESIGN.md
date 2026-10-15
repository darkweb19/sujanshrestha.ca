---
version: alpha
colors:
  background: "#fafafa"
  surface: "#ffffff"
  subtle: "#f4f4f5"
  primary: "#6f4e37"
  accent: "#3c2415"
  text: "#0a0a0a"
  muted: "#52525b"
  dim: "#71717a"
typography:
  sans:
    fontFamily: "Geist, system-ui, sans-serif"
  mono:
    fontFamily: "Geist Mono, monospace"
rounded:
  control: "9px"
  card: "14px"
  panel: "16px"
spacing:
  card: "18px"
  panel: "24px"
  column: "32px"
components:
  skillCard:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
  archivePanel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    rounded: "{rounded.panel}"
  sourcePreview:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.text}"
  description:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
  fileMetadata:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.dim}"
---

# Sujan Shrestha — design context

## Overview

This is a personal engineering portfolio with a small practical toolkit at `/lab/codex`. Preserve its existing identity: neutral surfaces, coffee accents, generous whitespace, Geist typography, rounded cards, and the shared monogram navigation and footer. The toolkit is a product surface inside this portfolio, not a new brand or marketplace.

The toolkit serves a developer selecting trusted coding instructions and packaging them for their next repository. Its memorable element is the live archive tree: the exact destination directories and supporting files remain tangible throughout selection. Keep the headline modest and the working interface prominent. Avoid large marketing claims, decorative metrics, new logos, emoji, gradients across application panels, and excessive motion.

The audience and interface language are English; there is no evidence of a Japan-specific market or regulated domain. User-imported Unicode content must remain readable and preserved.

## Colors

`app/globals.css` is the canonical runtime token source. Frontmatter snapshots its existing palette; change this document and the runtime tokens together when a durable system decision changes. Palette mappings: background → `--color-bg-0`, surface → `--color-bg-1`, subtle → `--color-bg-2`, primary → `--color-coffee`, accent → `--color-espresso`, text → `--color-text-primary`, muted → `--color-text-muted`, dim → `--color-text-dim`.

Toolkit components reference these tokens through `components/skills-toolkit/toolkit.module.css`; they do not create a separate theme. Coffee carries primary actions, folder names, and selected borders. White text appears only on the dark coffee action fill. Neutral muted text carries descriptions; dim text is reserved for secondary file counts and notes. Errors use restrained dark red text on a pale red surface; error meaning is also written explicitly.

## Typography

The existing root layout loads Geist Sans and Geist Mono. Runtime families remain `--font-sans` and `--font-mono`, with system fallbacks. Use Sans for navigation, labels, descriptions, and actions; Mono for archive paths and full source. The toolkit title is 32–48px, section headings 20px, card headings 15px, body copy 12–15px, and utility metadata 10–12px. Small utility text stays secondary; primary task controls and long-form editing remain legible.

## Layout

Reuse `.section-container` (1200px maximum, 24px horizontal padding). On desktop the working surface pairs a flexible library with a 352px archive panel and 32px gap. The library shows two cards per row when space permits, falling back to one in the intermediate width range. Below 760px the archive follows the library in document order; below 450px cards and filters are single-column. Dialogs fit the viewport and scroll internally; long paths and source content do not push page width.

The prompt composer follows the selection/export workflow. A two-column task/prompt layout becomes one column on smaller screens. Textareas have controlled height, no drag resize, and an explicit expand action for long prompts and files. Scrolling is owned by the global stylesheet; both standard scrollbar properties and the WebKit fallback use the same semantic tokens. Platform scrollbar geometry and native select popup geometry are accepted.

## Elevation & Depth

Use existing `--shadow-soft` for cards and `--shadow-card` for the archive. Borders provide primary grouping. A dialog is the only substantial overlay and has a muted backdrop. Do not introduce glass effects inside the working surface; the existing navigation keeps its established treatment.

## Shapes

Controls use 9px radii, skill cards 14px, working panels 16px, and dialogs 18px. Selection adds a coffee outline without changing card geometry. Keep tags compact and quietly squared; they are categories, not competing actions.

## Components

Canonical toolkit primitives live in `ToolkitPrimitives.tsx`: Button, Feedback, and Dialog. Form fields share scoped CSS. Native selects own keyboard behavior and platform popups; a native modal dialog owns focus containment and Escape semantics. Dialog mount captures and later restores the triggering focus. App-owned confirmation content controls removal and unsaved-change disposal.

Button hierarchy: coffee fill for the next principal action, bordered white for supporting actions, quiet coffee text for local utilities, and dark red outlined actions for removal. Every actionable element has a visible focus indicator. Disabled controls state a prerequisite through adjacent context or an explicit count; asynchronous operations preserve inputs and selections.

Source previews display complete text through React text nodes, never arbitrary HTML. Binary supporting files are retained but never rendered as text or executed. The tree is an interactive, keyboard-operable disclosure hierarchy rather than an imitation terminal.

Motion is limited to short color changes and the existing site shell. Reduced-motion preferences disable these changes. Forced-color mode preserves selected-card outlines and tree/tag boundaries.

## Do's and Don'ts

- Reuse site tokens and shared shell components; preserve all existing portfolio routes.
- Make archive directory mappings and selected counts concrete and current.
- Keep source attribution, license files, and supporting files available.
- Show import and validation failures near the initiating operation with a recovery action.
- Do not claim downloading a ZIP installs anything or that opening Codex submits a prompt.
- Do not add authentication, server persistence, analytics, or a new application identity for this personal tool.
