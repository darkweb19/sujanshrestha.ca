# YouTube Extractor live preview

The portfolio links to the live extractor and uses the existing lazy, fixed-URL
project browser. Source links, overview, keyboard dismissal, retry and
external-open controls remain available. No project iframe loads before a visitor
opens it.

## Current verified behavior

On 2026-11-06 the live response sent
`frame-ancestors https://sujanshrestha.ca`. A Chromium test under a locally
fulfilled canonical portfolio origin loaded the actual remote application with
the same sandbox permissions, including its heading and controls, without browser
errors. This fixture changed neither live website. No extraction job or
authenticated API request was submitted. It verifies framing and rendering;
authorized media processing remains the extractor's responsibility.

The visual-polish branch removes the obsolete blocked-preview notice. Localhost
and arbitrary preview origins remain disallowed by the extractor's exact-origin
policy. The portfolio browser suite uses controlled frame fixtures to verify
loading, slow/blocked recovery, source/external links, minimum content height and
keyboard behavior without depending on a remote service for every test.

## Original restriction and retained patch

On 2026-11-05 the extractor sent `frame-ancestors 'none'`, preventing every
embedded preview. The retained historical companion patch,
`patches/youtube-extractor-portfolio-embed.patch`, changes only that directive in
`darkweb19/youtube-extractor-rs` src/api.rs blob
`bd4bb3a2fb96adbf6db46730342ee473bfacde00`. All other CSP directives and API
bearer-token rules are preserved; there is no wildcard or CORS change.

This portfolio task did not apply that patch, modify extractor source or deploy
infrastructure. Its later observed live policy already permits the canonical
portfolio origin. Never embed an API token in the portfolio or treat a frame load
event alone as proof of successful remote content.
