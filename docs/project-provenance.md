# Project sources and media

Verified 2026-10-23 against public repositories and site responses. Existing four descriptions, stacks and original URLs in `lib/portfolio.ts` are retained unchanged. Short summaries are faithful presentation copy.

| Added project | Immutable evidence | Facts and boundaries |
| --- | --- | --- |
| FrameVault / Video Automation | [README](https://github.com/darkweb19/video-automation/blob/c85d376ca761b4fcfdd3e1627edc0d9ed15ffcca/README.md), [Go dependencies](https://github.com/darkweb19/video-automation/blob/c85d376ca761b4fcfdd3e1627edc0d9ed15ffcca/go.mod) | Go workspace for clips/five-scene stories, SQLite job/media state, reviewed manual YouTube uploads. Optional clipping analysis; no claim of candidate export or automatic scheduling/publishing. Live URL is repository-published `https://video.sujanshrestha.ca`. |
| YouTube Extractor in Rust | [README](https://github.com/darkweb19/youtube-extractor-rs/blob/52018c71be3999342d5c61721dc69b1d391b5ac3/README.md), [Cargo](https://github.com/darkweb19/youtube-extractor-rs/blob/52018c71be3999342d5c61721dc69b1d391b5ac3/Cargo.toml), [source](https://github.com/darkweb19/youtube-extractor-rs/blob/52018c71be3999342d5c61721dc69b1d391b5ac3/src/main.rs) | Rust/Axum/Tokio service using Apify metadata/media acquisition and FFmpeg processing. Progress/cancellation/authenticated delivery. Stale Cargo description mentioning native extraction is not used. No verified public demo URL exists. |

`public/images/projects/atsresumie.png` and `nevercomes.png` are actual 1280×800 Chromium captures of the public homepages. `framevault.png` captures the real public sign-in screen, not an authenticated product dashboard. Captured with reduced motion on 2026-10-23; no credentials or private state. Authored media/agent workflow illustrations are explicitly labeled and do not impersonate screenshots.

GitHub and FrameVault respond with framing restrictions (`X-Frame-Options: DENY`; CSP `frame-ancestors 'none'`). They receive overview/source treatment. ATSResumie and NeverComes have no observed framing restrictions and are the only configured live iframe candidates. Runtime verification and a persistent external fallback remain necessary; headers or iframe `load` alone do not guarantee rendering.
