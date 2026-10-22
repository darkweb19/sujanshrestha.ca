# Content preservation baseline

Captured before redesign implementation from commit `80a2e6e799be98e2daab781f26536ab8459018cc` on `feat/redesign`. The arrays below preserve exact source facts, claims, dates, spelling, supporting technologies, and links. Presentation may change; facts must not. Education “Present” dates are source facts and must not be inferred to have completed.

## Identity, biography and actions

| Field | Existing value | Source |
| --- | --- | --- |
| Full name | Sujan Shrestha | Hero; root metadata |
| Role | Full-Stack Software Engineer | Hero; root metadata |
| Location | Toronto, CA; Toronto, ON in employment | Hero; Experience |
| Hero description | I create beautiful products that empower people. Based in Toronto, CA. | Hero |
| Biography | Hey — I'm Sujan. I build web apps that feel smooth, modern, and a little bit “wow.” | About |
| Working approach | I love creating clean UI, subtle animations, and experiences that users enjoy using every day — across the full stack. | About |
| Philosophy | If you're building something ambitious and want a developer who cares about both engineering + aesthetics, let's connect. | About |
| Education introduction | From the foothills of the Himalayas to the shores of Lake Ontario — my educational journey across continents. | Academics |
| Contact invitation | Whether you have a project in mind, want to collaborate, or just want to say hello – I'd love to hear from you! | Contact |
| Resume | /Sujan.pdf; download filename Sujan_Shrestha_Resume.pdf | Hero |
| Email | hi@sujanshrestha.ca; mailto:hi@sujanshrestha.ca; copy and direct-email capabilities | Contact |
| GitHub | https://github.com/darkweb19 | Contact; footer; Person JSON-LD |
| LinkedIn | https://linkedin.com/in/sujansthadev | Contact; Person JSON-LD |
| Appointment | https://calendar.google.com/calendar/appointments/schedules/AcZssZ331o-aIQMcHXhJJauVR6l_PO4DVrWVsEUmOXRTEbi8co23c35KHsOIvXEaPa9MpWsDikVTWxVk?gv=true | ScheduleCallModal |
| Portrait | /images/sujan.jpg | HeroAnimations; Person JSON-LD |
| Copyright | Made with Next.js • All Rights Reserved © current year | Footer |

The hero's “HELLO WORLD” eyebrow and numbered section labels are presentation, not career facts. Removing gradients, excessive cards, animation, repeated headings, or decorative numbering is permitted by the redesign brief. Original prose remains available in Git at the baseline SHA.

## Experience

Source: `components/Experience.tsx`. Preserve every object field below.

```json
[
  {
    "id": "exp-000",
    "title": "Founding AI Engineer",
    "type": "Permanent Full-time",
    "company": "Atsresumie",
    "location": "Toronto, ON",
    "period": "Jan 2026 – Present",
    "status": "ACTIVE",
    "technologies": [
      "TypeScript",
      "Node.js",
      "React",
      "Docker",
      "GitHub Actions",
      "REST APIs"
    ],
    "highlights": [
      "Architected and built scalable REST APIs and microservices using Node.js and TypeScript, establishing foundation for platform growth",
      "Developed comprehensive component architecture and shared systems enabling cross-functional teams to build features independently",
      "Built full-stack features ensuring seamless integration between frontend React applications and backend services",
      "Implemented containerized services using Docker with CI/CD pipelines via GitHub Actions, improving deployment reliability and developer experience",
      "Designed automated generation pipeline transforming user inputs into structured outputs, optimizing performance for growing user base",
      "Led end-to-end development lifecycle from system design through deployment, collaborating closely with stakeholders to translate requirements into technical solutions"
    ]
  },
  {
    "id": "exp-001",
    "title": "Backend Developer",
    "type": "Part-time/Contract",
    "company": "NextUnicorn",
    "location": "Remote",
    "period": "April 2025 – Oct 2025",
    "status": "COMPLETED",
    "technologies": [
      "TypeScript",
      "Node.js",
      "Next.js",
      "Docker",
      "Jest",
      "PostgreSQL",
      "Supabase"
    ],
    "highlights": [
      "Worked on backend microservice architecture with a focus on the Authentication Microservice",
      "Implemented secure user authentication flows and authorization protocols",
      "Wrote test cases for authentication microservice endpoints using Supertest",
      "Collaborated with the DevOps team to streamline deployment processes"
    ]
  },
  {
    "id": "exp-002",
    "title": "Frontend Developer Intern",
    "type": "Internship",
    "company": "Dobaato",
    "location": "Remote",
    "period": "Jan 2025 – May 2025",
    "status": "COMPLETED",
    "technologies": [
      "TypeScript",
      "React.js",
      "Next.js",
      "Redux",
      "Docker",
      "Supabase",
      "PostgreSQL"
    ],
    "highlights": [
      "Built Dobaato's landing page and integrated a CMS for blogs and career section",
      "Saahitt Project: Integrated Django backend with Next.js frontend",
      "Collaborated with UI/UX team to align frontend with design requirements",
      "Assisted in SEO optimization and content structuring for organic reach"
    ]
  },
  {
    "id": "exp-003",
    "title": "Open-Source Contributor",
    "type": "Contributor",
    "company": "KeepReact",
    "location": "Remote",
    "period": "Sept 2023 – Nov 2023",
    "status": "COMPLETED",
    "technologies": [
      "React",
      "TypeScript",
      "CSS",
      "Git"
    ],
    "highlights": [
      "Resolved UX issue by fixing avatar image group redirection behavior",
      "Contributed improvements to frontend UI for better usability"
    ]
  }
]
```

## Projects

Source: `components/Projects.tsx`. Preserve every object field below.

```json
[
  {
    "title": "ATSResumie",
    "description": "AI-powered resume builder that analyzes job descriptions and optimizes resumes for ATS compatibility. Features real-time PDF generation and smart suggestions.",
    "tech": [
      "Next.js",
      "TypeScript",
      "Supabase",
      "OpenAI",
      "AWS Lambda"
    ],
    "url": "https://atsresumie.com",
    "featured": true
  },
  {
    "title": "Outpost",
    "description": "Self-hosted, browser-accessible cloud environment for running Claude Code in isolated Docker sandboxes. Spin up disposable containers, drive them from a real terminal in the browser, and compare configuration profiles side by side — credentials never leave your infrastructure.",
    "tech": [
      "React",
      "Fastify",
      "Docker",
      "Drizzle ORM",
      "Fly.io"
    ],
    "url": "https://github.com/useoutpost-dev/outpost",
    "featured": false
  },
  {
    "title": "DraftForge",
    "description": "Local-first CLI that turns a rough Markdown idea into an architecture interview, recorded decisions, a phased implementation plan, and an agent-ready scaffold. A lead model decides but never implements, cheaper worker models execute bounded task contracts, and a reviewer gates every step.",
    "tech": [
      "Node.js",
      "CLI",
      "Anthropic API",
      "OpenAI API",
      "Codex CLI"
    ],
    "url": "https://github.com/darkweb19/draftforge",
    "featured": false
  },
  {
    "title": "NeverComes",
    "description": "A deadpan parody shopping & food-delivery app. Browse products, add to cart, checkout, and track your courier on a live map — the order never arrives. All the dopamine of buying, none of the receipt.",
    "tech": [
      "Next.js",
      "TypeScript",
      "Supabase",
      "MapLibre GL JS",
      "Zustand"
    ],
    "url": "https://nevercomes.sujanshrestha.ca",
    "featured": false
  }
]
```

## Education

Source: `components/Academics.tsx`. Preserve every object field below.

```json
[
  {
    "level": "Diploma in Computer System Technician",
    "institution": "Loyalist College, Toronto",
    "description": "Currently pursuing diploma in Computer System Technician.",
    "year": "2024 - Present",
    "country": "canada",
    "highlight": true
  },
  {
    "level": "Bachelor's Degree in CSIT",
    "institution": "St Lawrence College, Kathmandu",
    "description": "Studying Bachelor's Degree in Computer Science and Information Technology at Tribhuwan University.",
    "year": "2020 - Present",
    "country": "nepal",
    "highlight": false
  },
  {
    "level": "MERN Stack Bootcamp",
    "institution": "Deerwalk Institute of Technology",
    "description": "Completed intensive bootcamp course in the MERN stack.",
    "year": "2023",
    "country": "nepal",
    "highlight": false
  },
  {
    "level": "Intermediate in Science (+2 Science)",
    "institution": "Himalayan Pyramid Higher Secondary School, Birgunj",
    "description": "Passed Higher Secondary Education Examination held by NEB, Nepal with GPA 3.19.",
    "year": "2018 - 2020",
    "country": "nepal",
    "highlight": false
  },
  {
    "level": "Secondary Education (SEE)",
    "institution": "Little Flower Secondary School, Birgunj",
    "description": "Passed Secondary Education Examination held by Ministry of Education, Nepal with GPA 3.35.",
    "year": "2018",
    "country": "nepal",
    "highlight": false
  }
]
```

## Technology inventory

Source: `components/About.tsx`. Preserve every object field below.

```json
[
  "Next.js",
  "TypeScript",
  "React",
  "Node.js",
  "AWS",
  "Docker",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "Linux",
  "GitHub"
]
```

## Public route and asset contract

| Route / destination | Required preservation |
| --- | --- |
| / | Portfolio identity and all factual content |
| /#home, /#about, /#experience, /#projects, /#academics, /#contact | Existing anchor destinations remain functional |
| /blogs | Crawlable writing index, newest first |
| /blog | Existing permanent redirect to /blogs |
| /blogs/reverse-proxy-ssrf-cannon | Complete published article, source links and code blocks unchanged |
| /blogs/supabase-unlimited-free | Complete published article, source links and code blocks unchanged |
| /lab/codex | Public Skills Toolkit and all supported export capabilities |
| /pubg-overlay.html | Existing standalone PUBG stream overlay |
| /Sujan.pdf | Existing resume file bytes |
| /images/sujan.jpg | Authentic portrait retained |
| /skills-toolkit/*.json | Ten legacy built-in package URLs remain valid for existing consumers/migration |
| /robots.txt, /sitemap.xml | Crawl policy and canonical content routes |
| /opengraph-image, /apple-icon, /favicon.ico | Existing metadata asset purposes preserved with deliberate new branding |

## Published writing

The Markdown files, including every paragraph, source link, code example and claim, must remain byte-identical unless a separate correction is expressly justified. Rendered article styling may change.

### /blogs/reverse-proxy-ssrf-cannon

```yaml
title: "Your reverse proxy is an SSRF cannon by default"
date: "2026-07-26"
description: "Every reverse proxy tutorial resolves the upstream address from the Host header. That single line is the vulnerability. Here are the three layers I ended up needing to make preview URLs safe."
tags: ["security", "ssrf", "node", "reverse-proxy", "typescript"]
```

SHA-256: `be0c51e089bed6d38abc03d191c656167e92f4970672fe8274fba8fdd8f4c180`.

### /blogs/supabase-unlimited-free

```yaml
title: "Keeping Supabase Alive on the Free Tier With a Simple Cron Job"
date: "2026-07-08"
description: "Supabase pauses free projects after a week of no activity. Here's the small GitHub Actions workflow I built to keep mine running, for free, forever."
tags: ["supabase", "github-actions", "ci-cd", "devops"]
```

SHA-256: `7567f96b330b44b69cd73889ef488facffa36a704bf3d30d367ce0d806a358e1`.

## Original asset integrity

| File | SHA-256 |
| --- | --- |
| public/Sujan.pdf | 89e638c3d6ce55574cf5a8eb386cb665cde98e5809f4fe5b1bb190b1988c302c |
| public/images/sujan.jpg | afc36cb6477593af311992c1f18f7fb9fbd4e6b4e17c086c42154a168c43c2f7 |
| public/pubg-overlay.html | 92afad71238a558e4c48693b02ca5ab365f51c4a515a69ca7c24b94f98af2642 |

## Lab capability and provenance ledger

- Built-in source: darkweb19/skills at pinned revision 02e3bc090208bebb8cbf0ddc1985c51235c67b8f. Existing ten public JSON packages: senior-frontend, cto-advisor, code-reviewer, focused-fix, security-pen-testing, senior-qa, api-design-reviewer, performance-profiler, codebase-onboarding, database-designer. This list is a compatibility baseline, not the full desired upstream inventory.
- Search/category filtering; multi-selection; complete original SKILL.md preview; supporting file preview; archive tree; selected-only ZIP download; prompt composer and clipboard recovery.
- Codex, Claude Code, Cursor, GitHub Copilot retain distinct documented archive mappings and complete text/binary supporting bytes.
- Markdown and ZIP import, GitHub public package import, validation/clear recovery, edit/remove own imports, stored-data recovery, unsaved changes confirmation.
- Old persistent source is IndexedDB. Existing browser imports must remain recoverable through explicit export/reimport or a consent-based migration; no silent deletion. New SQLite persistence and admin authentication supersede browser-only mutation policy.

## Metadata facts

Identity URL https://sujanshrestha.ca; language English; Open Graph locale en_CA; Person role Full-Stack Software Engineer; Toronto / CA location; sameAs GitHub and LinkedIn above. Existing education JSON-LD names: Loyalist College (Toronto, CA); Tribhuwan University - St Lawrence College (Kathmandu, NP); Deerwalk Institute of Technology (Kathmandu, NP). Do not imply graduation where the visible source says currently studying.

## Post-redesign comparison procedure

- Compare all four employment entries, five education entries, four projects, eleven general technologies, every employment/project technology and every highlight against this ledger.
- Require every period, institution, location, GPA, source/demo destination, resume and contact channel in rendered portfolio HTML.
- Require both Markdown SHA-256 values and original asset SHA-256 values to match.
- Request all public routes and existing anchor links; check semantic headings, no truncation of project descriptions, and no content hidden behind animation or consent.
- Confirm that user uploads persist across browser sessions/app restart and upstream-managed packages cannot be edited through user-import management.
- Record actual results in the final verification documentation; this initial baseline is evidence of the starting content, not a claim that the future implementation passes.
