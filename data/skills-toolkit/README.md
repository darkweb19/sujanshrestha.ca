# Built-in skill provenance

The ten built-in packages come from [darkweb19/skills](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f), pinned to commit `02e3bc090208bebb8cbf0ddc1985c51235c67b8f`. The source README describes a collection of Markdown skills with supporting resources. Its root LICENSE is Apache License 2.0. Original author and copyright notices are retained in the files.

| Toolkit display name | Original skill |
| --- | --- |
| Frontend Design | [senior-frontend](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/senior-frontend) |
| CTO Advisor | [cto-advisor](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/cto-advisor) |
| Code Review | [code-reviewer](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/code-reviewer) |
| Debugging | [focused-fix](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/focused-fix) |
| Security Audit | [security-pen-testing](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/security-pen-testing) |
| Testing | [senior-qa](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/senior-qa) |
| API Design | [api-design-reviewer](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/api-design-reviewer) |
| Performance Optimization | [performance-profiler](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/performance-profiler) |
| Documentation | [codebase-onboarding](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/codebase-onboarding) |
| Database Architecture | [database-designer](https://github.com/darkweb19/skills/tree/02e3bc090208bebb8cbf0ddc1985c51235c67b8f/database-designer) |

Display labels describe the toolkit categories; the original frontmatter names remain unchanged. Debugging uses the repository's feature-repair workflow, Documentation uses its codebase-documentation workflow, and Frontend Design uses its React/Next.js frontend workflow. These are real existing skills, not authored placeholders.

Every tracked file under each selected upstream skill directory is included unchanged, preserving all relative paths. Each package additionally includes the upstream root license as `SOURCE-LICENSE-APACHE-2.0.txt` and a `SOURCE-ATTRIBUTION.md` with its full pinned source URL. The CTO Advisor frontmatter additionally declares MIT; the source supplied no separate MIT license text. That declaration is preserved and documented without inventing a different notice. Upstream references to other skills remain text; separate sibling packages are not implicitly included.

The 96 original files total 1,178,665 bytes. Including added license and attribution files, the ten complete packages contain 116 files and 1,303,384 bytes. Full package contents are served as static JSON under `public/skills-toolkit/`; the browser initially loads only catalog metadata and path manifests. The UI must call `loadBuiltinSkill(slug)` before validating or exporting a built-in package. Upstream scripts are data and are never executed by the toolkit.

To regenerate from a trusted local checkout at the exact pinned commit:

```sh
node scripts/sync-skills-toolkit.mjs /path/to/skills-checkout
```

The script reads immutable Git objects, verifies the commit, and copies bytes without running upstream programs. `sources.json` records selection metadata. `source-checksums.json` records SHA-256 and byte counts for every original file. The catalog tests verify these against every complete static package, along with schema validation and lazy-load failure handling. Update the source pin deliberately when reviewing a new upstream version, then regenerate and rerun tests.
