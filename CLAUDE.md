# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml` is committed).

- `pnpm dev` — run dev server at http://localhost:3000
- `pnpm build` — production build (also the typecheck/lint gate; run before shipping)
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test suite. Verify changes with `pnpm build` and by driving the page in `pnpm dev`.

## Architecture

Single-page personal portfolio built on **Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, TypeScript strict**. There is no backend, database, or API — it's a static-rendered marketing site.

- **`app/page.tsx`** is the whole homepage. It composes section components in order (`Hero`, `About`, `Experience`, `Projects`, `Academics`, `Contact`) between `Navbar` and `Footer`. Everything below the fold is `next/dynamic`-imported with a `min-h-[50vh]` placeholder to keep the initial bundle small — keep new below-the-fold sections on that pattern.
- **Sections = client components.** Each `components/*.tsx` section is `"use client"` and drives its own scroll-reveal animations with Framer Motion. Each renders a `<section id="...">` whose id matches a hash link.
- **Navigation is hash-based.** `components/common/Navbar.tsx` holds `navLinks` pointing at `#home`, `#about`, `#experience`, `#projects`, `#academics`, `#contact`. Adding or renaming a section means updating both the section's `id` and this list. Smooth scrolling comes from `scroll-smooth` on `<html>` (layout) + `scroll-behavior` in globals.css — a past bug had scroll getting stuck mid-page, so test anchor jumps after touching scroll behavior.
- **`app/blog/page.tsx`** is the only other route — a static list rendered from a hardcoded `blogPosts` array. No CMS; posts are edited inline.

## Styling & design system

Tailwind CSS v4 with tokens defined in **`app/globals.css`** under `@theme` (no `tailwind.config.js`). It's a warm coffee/beige dark palette — use the semantic token classes rather than raw hex:

- Colors: `bg-bg-0/1/2`, `text-text-primary/muted/dim`, `beige-highlight/accent/deep`, `primary-start/end`, `coffee`, `espresso`, `mocha`.
- Custom utility classes (defined in globals.css): `.section-container` (page gutter/max-width wrapper — use on every section), `.glass` / `.glass-beige` (frosted cards), `.gradient-text`, `.glow-primary` / `.glow-beige`.
- Fonts: Geist Sans/Mono via `next/font`, exposed as `--font-geist-sans` / `--font-geist-mono`.

Code style: tabs for indentation, double quotes, `@/*` path alias maps to repo root.

## SEO

SEO is a first-class concern and spread across several files — update them together when identity/URL changes:
- `app/layout.tsx` — global `metadata` (Open Graph, Twitter, `metadataBase` = https://sujanshrestha.ca).
- `app/page.tsx` — inline JSON-LD `Person` structured data.
- `app/sitemap.ts` and `app/robots.ts` — generated sitemap/robots. Add new routes to the sitemap array.

## Assets

- Resume PDF is served from `public/Sujan.pdf` and linked from `components/Hero.tsx` via a `download` anchor. Keep the href in sync if the file is renamed.
- Profile image: `public/images/sujan.jpg`.
