# YouTube Extractor live preview

The portfolio now links to the supplied live URL and uses the existing lazy,
fixed-URL project browser. It retains the GitHub source link, project overview,
keyboard dismissal, retry and external-open controls. No third-party iframe loads
until a visitor opens the project.

## Remaining external prerequisite

On 2026-11-05 the live app returned HTTP 200 with
`Content-Security-Policy: … frame-ancestors 'none'; …`. That policy correctly
prevents every embedded preview. Portfolio code cannot override it.

`patches/youtube-extractor-portfolio-embed.patch` is a minimal companion patch
against `darkweb19/youtube-extractor-rs`, `src/api.rs` blob
`bd4bb3a2fb96adbf6db46730342ee473bfacde00`. It replaces only the HTML page's
`frame-ancestors` directive with the exact canonical portfolio origin,
`https://sujanshrestha.ca`. Every other CSP directive and API bearer-token rule
stays intact. No wildcard, arbitrary-site proxy, public token or CORS change.

This patch is prepared for review; it has not been applied to that repository,
Rust-tested or deployed. Apply it on a separate branch in the extractor repo,
run its tests and security checks, then deploy through its normal release flow.
After deployment verify the returned header and real embedded page. Localhost
and branch-preview origins deliberately remain disallowed. Remove the temporary
`previewNotice` in `lib/portfolio.ts` only after the real production iframe renders.

The portfolio browser suite verifies the live URL, lazy iframe boundary, source
link and blocked/slow recovery using controlled fixtures. It does not claim the
current remote app permits framing. Media processing still requires the app's
own authorized operator access; never put an API token in the portfolio.


## Verified policy update — 2026-11-06

The live response now sends `frame-ancestors https://sujanshrestha.ca`.
A real Chromium iframe test under a locally fulfilled canonical portfolio origin
loaded the actual remote application with the same sandbox permissions, including
its heading and controls, and no browser errors. No extraction job or authenticated
API request was submitted. This verifies framing/rendering, not authorized media
processing. The stale portfolio blocked-preview notice has been removed in the
visual-polish branch. The historical companion patch remains for provenance;
no extractor source or deployment was changed by this polish task.
