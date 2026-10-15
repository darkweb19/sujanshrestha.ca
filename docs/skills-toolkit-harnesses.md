# Skills toolkit harness contracts

Checked on **2026-10-15**. These are repository-scoped skill packages, not rules, agent definitions, hooks, or MCP installations. The adapters retain every source file and change only the export root. Compatibility warnings do not strip metadata or rewrite instructions.

| Harness | Export root | Frontmatter recognized by this adapter | Host-specific behavior |
| --- | --- | --- | --- |
| OpenAI Codex | `.agents/skills` | `name`, `description`, `metadata` | Optional `agents/openai.yaml` describes interface, invocation policy, and tool dependencies. It does not provision those tools. |
| Claude Code | `.claude/skills` | `name`, `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `context`, `agent`, `hooks`, `effort`, `background`, `paths`, `shell`, `metadata`, `license`, `compatibility` | Invocation, subagent context, tool controls, substitutions, and hooks are Claude-specific and subject to host policy/version. |
| Cursor | `.cursor/skills` | `name`, `description`, `paths`, `disable-model-invocation`, `icon`, `color`, `metadata`; legacy `globs` fallback | Automatic discovery at startup; manual invocation through `/`; `paths` scopes skills to matching files; `icon` and `color` style the Custom Mode badge. |
| GitHub Copilot | `.github/skills` | `name`, `description`, `license`, `allowed-tools` | Official documentation currently describes `allowed-tools`; permission semantics and available tools depend on the Copilot host. Skills support must not be inferred from ordinary chat availability. |

All adapters preserve `scripts/`, `references/`, `assets/`, and other safe supporting paths, including binary files. This toolkit never executes imported scripts. Archive extraction may not retain executable flags, and target environments must supply interpreters, packages, credentials, and tool permissions. Browser code cannot determine which dependencies are installed in a separate target repository.

## Official documentation evidence

The current official documentation for **all four harnesses was retrieved and read directly**: Codex and Claude Code through their official Markdown representations, Cursor and GitHub Copilot through their official documentation pages. The current schemas, discovery rules, supporting resources, and invocation behavior were checked separately for each harness. Pinned official repository sources below provide additional implementation evidence. No unsupported behavior was inferred from another harness.

### OpenAI Codex

- [Current official Markdown documentation](https://developers.openai.com/codex/skills.md) was retrieved successfully (HTTP 200) and read in full. Its “Where Codex loads local skills” table confirms repository `.agents/skills` discovery from the working directory through the repository root; the required file includes `name` and `description`. “Optional metadata” confirms `agents/openai.yaml` appearance, `policy.allow_implicit_invocation`, and MCP tool dependencies. Explicit `$skill` invocation remains available when implicit invocation is disabled.
- The [canonical HTML documentation URL](https://developers.openai.com/codex/skills/) redirects to [Build skills](https://learn.chatgpt.com/docs/build-skills). The official Markdown endpoint above provided the current “Build skills” content directly; verification did not depend on retrieving the redirected HTML page.
- [Official skill creator](https://github.com/openai/codex/blob/3ee47c10513f1bb57d869ea650aba28638e3d11c/codex-rs/skills/src/assets/samples/skill-creator/SKILL.md) documents required `name`/`description`, optional `metadata`, scripts, references, assets, and `agents/openai.yaml`.
- [Repository discovery source](https://github.com/openai/codex/blob/3ee47c10513f1bb57d869ea650aba28638e3d11c/codex-rs/ext/skills/src/host_roots.rs) checks ancestor `.agents/skills` directories.
- [Frontmatter parser](https://github.com/openai/codex/blob/3ee47c10513f1bb57d869ea650aba28638e3d11c/codex-rs/skills/src/parser.rs) recognizes `name`, `description`, and `metadata.short-description`. The parser can tolerate a missing name by using a default; this toolkit deliberately requires explicit portable names for exports.
- [OpenAI YAML reference](https://github.com/openai/codex/blob/3ee47c10513f1bb57d869ea650aba28638e3d11c/codex-rs/skills/src/assets/samples/skill-creator/references/openai_yaml.md) identifies MCP dependencies and `policy.allow_implicit_invocation` as product-specific configuration.

### Claude Code

- [Canonical skills documentation](https://code.claude.com/docs/en/skills), retrieved successfully as its [official Markdown representation](https://code.claude.com/docs/en/skills.md) (HTTP 200). The “Where skills live” table verifies `.claude/skills/<skill-name>/SKILL.md`; “Frontmatter reference” documents every Claude field listed in the adapter table above.
- Unlike the portable toolkit contract, current Claude Code permits all frontmatter fields to be omitted, with directory/body fallbacks. This toolkit continues requiring explicit `name` and `description` for portability across all four harnesses. Claude Code accepts `metadata`, `license`, and `compatibility` while not acting on their contents; those fields are retained without false unsupported-field warnings.
- Claude Code's documented boolean fields additionally accept `yes`, `no`, `on`, `off`, `1`, and `0`, case-insensitively. Compatibility validation recognizes those values without rewriting them. Current docs reserve the directory names `synced` and `anthropic-skills`; exports targeting Claude Code reject these incompatible names. Tool preapproval, dynamic shell injection, hooks, and subagent behavior remain host-policy dependent.
- [Official skills repository README](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/README.md) describes skill folders, supporting scripts/resources, and required `name` and `description` frontmatter.
- [Official Claude Code changelog](https://github.com/anthropics/claude-code/blob/94506ff0d3bd9185f1752da36e968775021fb48f/CHANGELOG.md) corroborates repository `.claude/skills` discovery and implementation-specific metadata, including `allowed-tools`, `disallowed-tools`, `argument-hint`, `user-invocable`, `disable-model-invocation`, `context: fork`, `model`, `effort`, and `background`. Unrecognized metadata remains intact and receives a warning.

### Cursor

- [Official Agent Skills documentation](https://cursor.com/docs/skills) was retrieved successfully (HTTP 200) after following the old `/docs/context/skills` redirect. The “Skill directories” table confirms both `.agents/skills/` and `.cursor/skills/` as project-level directories; the toolkit preserves the requested `.cursor/skills` mapping.
- “Frontmatter fields” requires `name` and `description`; names must match the containing folder. Optional fields are `paths`, `disable-model-invocation`, `icon`, `color`, and arbitrary-map `metadata`. “Scoping a skill to specific files” accepts `paths` as a comma-separated string or list and documents the legacy `globs` fallback. The adapter warns when exporting legacy `globs` but does not replace it.
- “Using a skill as a Custom Mode” documents `icon` and these colors: `default`, `green`, `cyan`, `blue`, `purple`, `magenta`, `orange`, `yellow`, `red`, `brand`. Unrecognized badges fall back to defaults; the adapter reports an unsupported color as a warning, preserving the source.
- “How skills work” describes automatic discovery when Cursor starts and manual `/` invocation. `disable-model-invocation: true` prevents automatic inclusion. A manually invoked skill attaches to one message; a Custom Mode can retain it for the session. “Optional directories” confirms `scripts/`, `references/`, and `assets/`.
- Project skills must be present in the repository used by a remote agent. Personal-skill sync and marketplace/plugin import are distinct workflows; this toolkit exports repository files and does not claim to configure those integrations.

### GitHub Copilot

- [Canonical overview](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) and [current installation documentation](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) were both retrieved directly (HTTP 200), confirming the official repository evidence below.
- [Official overview source](https://github.com/github/docs/blob/0226a2d78cf2be40ee3d769ec5661638461af0cc/content/copilot/concepts/agents/about-agent-skills.md) lists repository `.github/skills`, `.claude/skills`, and `.agents/skills`; this toolkit chooses the requested `.github/skills` root.
- [Official creation documentation source](https://github.com/github/docs/blob/0226a2d78cf2be40ee3d769ec5661638461af0cc/data/reusables/copilot/creating-adding-skills.md) requires `SKILL.md`, `name`, and `description`, permits `license` and supporting resources, and explicitly documents `allowed-tools` tool preapproval with warnings about shell permissions.
- [Official installation how-to source](https://github.com/github/docs/blob/0226a2d78cf2be40ee3d769ec5661638461af0cc/content/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills.md) describes supported agent hosts and current CLI installation. The toolkit uses plain extraction instructions, not CLI commands whose availability varies by version.

## API and validation

`lib/skills-toolkit/harnesses.ts` exports `HARNESSES`, `getHarness(id)`, and `getCompatibilityIssues(skill, harness)`, plus the `HarnessAdapter` type. Configuration contains display information, repository root, supported metadata/structure, validation requirements, export behavior, installation instructions, and an official documentation URL. The original `skillRoot`/`instructions` fields remain the UI and archive integration API; `rootDirectory`/`installationInstructions` expose the same values explicitly.

`getCompatibilityIssues` performs shared package validation, validates known boolean/tool-control metadata, glob field types, and metadata mappings, and warns about unverified fields, Claude substitutions on other hosts, Codex configuration on other hosts, scripts, and dependency manifests. Cursor-specific fields are supported for Cursor without being assumed to work elsewhere. Neither validation nor export modifies the stored source package. Missing relative Markdown resource links are detected by shared package validation. Runtime dependencies are flagged for target-environment verification rather than falsely reported as installed or absent.

`lib/skills-toolkit/prompt.ts` exports `generatePrompt(skills, harness, requirements, installed)` and `CODEX_WEB_URL`. The `installed` flag must come from an explicit user assertion. Even then the generated prompt instructs the agent to verify its current checkout. Downloading a ZIP does not set this flag. Before confirmation, paths are described only as intended destinations and the prompt explains installation is required.

The Codex launcher opens exactly `https://chatgpt.com/codex`. There are no submission, skill installation, or invented deep-link URL parameters. Other harnesses receive installation instructions and copyable prompts.

## Verification

Run `pnpm test` for the toolkit suites, including `tests/harnesses.test.ts`. That suite covers all four root contracts, metadata/runtime warnings, preservation of source data, installation assertions, and launcher URL semantics. Archive tests separately verify exact ZIP paths and supporting file bytes for every harness. These tests validate exported package behavior; they do not execute the four external agent applications.
