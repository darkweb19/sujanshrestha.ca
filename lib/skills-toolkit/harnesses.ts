import { parseDocument } from "yaml";
import type { HarnessAdapter, HarnessId, SkillPackage, ValidationIssue } from "./types";
import { validateSkillPackage } from "./validation";

export type { HarnessAdapter } from "./types";

function adapter(config: Pick<HarnessAdapter, "id" | "name" | "description" | "skillRoot" | "supportedMetadata" | "supportedStructure" | "documentationUrl"> & { activation: string }): HarnessAdapter {
	const instructions = [
		`Download the ZIP and extract its contents into your target repository root, preserving the hidden ${config.skillRoot.split("/")[0]}/ directory.`,
		`Confirm each selected package exists at ${config.skillRoot}/<skill-name>/SKILL.md. Resolve compatibility warnings and review supporting scripts before use.`,
		config.activation,
	];
	return {
		id: config.id,
		name: config.name,
		description: config.description,
		skillRoot: config.skillRoot,
		rootDirectory: config.skillRoot,
		supportedMetadata: config.supportedMetadata,
		supportedStructure: config.supportedStructure,
		documentationUrl: config.documentationUrl,
		instructions,
		installationInstructions: instructions,
		supportsSupportingFiles: true,
		validationRequirements: ["Root SKILL.md with valid YAML name and description", "Lowercase skill folder matching the name", "Safe, unique relative file paths", "Dependencies and permissions verified in the target runtime"],
		exportBehavior: "Preserve all original file bytes and relative paths; change only the repository skill root. Unsupported metadata is retained with warnings.",
	};
}

export const HARNESSES: HarnessAdapter[] = [
	adapter({
		id: "codex", name: "OpenAI Codex", skillRoot: ".agents/skills",
		description: "Repository skills with optional OpenAI invocation and UI metadata.",
		supportedMetadata: ["name", "description", "metadata"],
		supportedStructure: ["SKILL.md", "scripts/", "references/", "assets/", "agents/openai.yaml"],
		documentationUrl: "https://developers.openai.com/codex/skills/",
		activation: "Open the repository in Codex. Ask it to use the selected skill instructions; verify the files are present in the Codex task environment as well as your local checkout.",
	}),
	adapter({
		id: "claude-code", name: "Claude Code", skillRoot: ".claude/skills",
		description: "Repository skills with Claude-specific invocation and tool controls.",
		supportedMetadata: ["name", "description", "when_to_use", "argument-hint", "arguments", "disable-model-invocation", "user-invocable", "allowed-tools", "disallowed-tools", "model", "context", "agent", "hooks", "effort", "background", "paths", "shell", "metadata", "license", "compatibility"],
		supportedStructure: ["SKILL.md", "scripts/", "references/", "assets/"],
		documentationUrl: "https://code.claude.com/docs/en/skills",
		activation: "Open the repository in Claude Code. Ask it to use a selected skill, or invoke /<skill-name> when that skill permits user invocation. Host policy still controls tool permissions.",
	}),
	adapter({
		id: "cursor", name: "Cursor", skillRoot: ".cursor/skills",
		description: "Repository agent skills with file scoping, explicit invocation, and Custom Mode metadata.",
		supportedMetadata: ["name", "description", "paths", "globs", "disable-model-invocation", "icon", "color", "metadata"],
		supportedStructure: ["SKILL.md", "scripts/", "references/", "assets/"],
		documentationUrl: "https://cursor.com/docs/skills",
		activation: "Open the target repository in Cursor; it discovers repository skills at startup. Ask Agent to use a relevant skill, or type / and select the skill name. Skills with disable-model-invocation: true require explicit invocation. View discovered skills in Customize → Skills.",
	}),
	adapter({
		id: "github-copilot", name: "GitHub Copilot", skillRoot: ".github/skills",
		description: "Repository skills for Copilot agents; availability depends on the Copilot host.",
		supportedMetadata: ["name", "description", "license", "allowed-tools"],
		supportedStructure: ["SKILL.md", "scripts/", "references/", "assets/"],
		documentationUrl: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
		activation: "Use a Copilot host that supports agent skills, such as its coding agent, CLI, or IDE agent mode. Commit or upload the skill files to the repository used by that host; ordinary chat availability does not establish skill support.",
	}),
];

export function getHarness(id: HarnessId): HarnessAdapter {
	const harness = HARNESSES.find((item) => item.id === id);
	if (!harness) throw new Error(`Unknown AI harness: ${id}`);
	return harness;
}

/** Compatibility is advisory: export never rewrites the source package. */
export function getCompatibilityIssues(skill: SkillPackage, harness: HarnessAdapter): ValidationIssue[] {
	const issues = validateSkillPackage(skill);
	const warn = (message: string, path = "SKILL.md") => issues.push({ severity: "warning", message, path });
	const entry = skill.files.find((file) => file.path === "SKILL.md" && file.encoding === "utf8");
	if (!entry || issues.some((issue) => issue.severity === "error")) return issues;
	const block = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(entry.content);
	if (!block) return issues;
	const document = parseDocument(block[1], { schema: "core", uniqueKeys: true });
	const fields = document.toJS({ maxAliasCount: 0 }) as Record<string, unknown>;
	const error = (message: string) => issues.push({ severity: "error", message, path: "SKILL.md" });
	for (const key of Object.keys(fields)) {
		if (!harness.supportedMetadata.includes(key)) warn(`${harness.name}: metadata “${key}” is not verified as supported. It is preserved, but may be ignored or behave differently.`);
	}
	for (const key of ["disable-model-invocation", "user-invocable", "background"]) {
		if (!harness.supportedMetadata.includes(key) || !(key in fields)) continue;
		const value = fields[key];
		const claudeBoolean = harness.id === "claude-code" && ((typeof value === "string" && /^(?:true|false|yes|no|on|off|0|1)$/i.test(value)) || value === 0 || value === 1);
		if (typeof value !== "boolean" && !claudeBoolean) error(`${harness.name}: “${key}” must be a supported boolean value.`);
	}
	for (const key of ["allowed-tools", "disallowed-tools"]) {
		if (!harness.supportedMetadata.includes(key) || !(key in fields)) continue;
		const value = fields[key];
		if (typeof value !== "string" && !(Array.isArray(value) && value.every((tool) => typeof tool === "string"))) error(`${harness.name}: “${key}” must be a string or list of tool names.`);
	}
	for (const key of ["paths", "globs"]) {
		if (!harness.supportedMetadata.includes(key) || !(key in fields)) continue;
		const value = fields[key];
		if (typeof value !== "string" && !(Array.isArray(value) && value.every((pattern) => typeof pattern === "string"))) error(`${harness.name}: “${key}” must be a string or list of glob patterns.`);
	}
	if (harness.supportedMetadata.includes("metadata") && "metadata" in fields) {
		const metadata = fields.metadata;
		if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) error(`${harness.name}: “metadata” must be a YAML mapping.`);
		else if (harness.id === "codex" && "short-description" in metadata && typeof (metadata as Record<string, unknown>)["short-description"] !== "string") error("OpenAI Codex: metadata.short-description must be text.");
	}
	if (harness.id === "cursor") {
		if ("globs" in fields) warn("Cursor accepts legacy “globs” as a fallback; current skills should use “paths”. The original field is preserved.");
		if ("color" in fields && !["default", "green", "cyan", "blue", "purple", "magenta", "orange", "yellow", "red", "brand"].includes(String(fields.color))) warn("Cursor does not recognize this Custom Mode color and will use its default badge color. The original field is preserved.");
	}
	if (harness.id === "claude-code" && ["synced", "anthropic-skills"].includes(skill.slug.toLowerCase())) error(`Claude Code reserves the skill directory name “${skill.slug}”; this package will not load from the repository skills directory.`);
	if (fields["allowed-tools"] || fields["disallowed-tools"] || fields.permissions || fields.hooks) {
		warn(`${harness.name}: tool permissions and hooks depend on host policy and tool names. Export does not grant permissions or install hooks.`);
	}
	if (fields.dependencies || fields.compatibility || fields.requires) warn("Declared runtime requirements are preserved. Verify the required packages, credentials, tools, and versions in the target repository environment.");
	if (harness.id !== "claude-code" && /!`|\$ARGUMENTS|\$\{CLAUDE_|\$CLAUDE_/.test(entry.content)) {
		warn("Claude-specific command substitution or variables are present; the selected harness may not evaluate them.");
	}
	if (harness.id !== "codex" && skill.files.some((file) => file.path === "agents/openai.yaml")) {
		warn(`${harness.name} does not use Codex agents/openai.yaml invocation metadata. The file is preserved.`, "agents/openai.yaml");
	}
	if (harness.id === "codex" && skill.files.some((file) => file.path === "agents/openai.yaml")) {
		warn("Review agents/openai.yaml tool dependencies and invocation policy in the target Codex environment; exporting does not configure MCP servers or install dependencies.", "agents/openai.yaml");
	}
	const scripts = skill.files.filter((file) => /(?:^scripts\/|\.(?:sh|bash|py|js|mjs|cjs|ts|ps1|rb)$)/i.test(file.path));
	if (scripts.length) warn(`${scripts.length} supporting script${scripts.length === 1 ? " is" : "s are"} included as data. Review runtime dependencies, execution permissions, and executable flags after extracting; no scripts are executed or dependencies installed by this toolkit.`, scripts[0].path);
	const manifests = skill.files.filter((file) => /(?:^|\/)(?:package\.json|requirements[^/]*\.txt|pyproject\.toml|Pipfile|Gemfile|Cargo\.toml|go\.mod)$/.test(file.path));
	if (manifests.length) warn("Dependency manifests are included, but their packages are not installed or verified. Check them in the target runtime.", manifests[0].path);
	return issues;
}
