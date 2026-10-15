import assert from "node:assert/strict";
import test from "node:test";
import { getCompatibilityIssues, getHarness, HARNESSES } from "../lib/skills-toolkit/harnesses";
import { CODEX_WEB_URL, generatePrompt } from "../lib/skills-toolkit/prompt";
import type { SkillPackage } from "../lib/skills-toolkit/types";

function fixture(extra = "", body = "Use the repository’s existing development workflow."): SkillPackage {
	return {
		id: "local:testing", slug: "testing", name: "Testing", description: "Test repository behavior", category: "Engineering",
		source: { kind: "local", label: "Local import" },
		files: [{ path: "SKILL.md", encoding: "utf8", content: `---\nname: testing\ndescription: Test repository behavior\n${extra}---\n\n${body}\n` }],
	};
}

test("every adapter declares its repository root and installation contract", () => {
	assert.deepEqual(HARNESSES.map((harness) => [harness.id, harness.skillRoot]), [
		["codex", ".agents/skills"], ["claude-code", ".claude/skills"], ["cursor", ".cursor/skills"], ["github-copilot", ".github/skills"],
	]);
	for (const harness of HARNESSES) {
		assert.equal(harness.rootDirectory, harness.skillRoot);
		assert.ok(harness.supportedMetadata.includes("name") && harness.supportedMetadata.includes("description"));
		assert.ok(harness.supportedStructure.includes("SKILL.md"));
		assert.ok(harness.validationRequirements.length && harness.exportBehavior && harness.installationInstructions.length && harness.documentationUrl.startsWith("https://"));
	}
});

test("Claude invocation metadata is retained but warned about for Codex", () => {
	const skill = fixture("disable-model-invocation: true\nallowed-tools: Read\n");
	const original = JSON.stringify(skill);
	assert.ok(getCompatibilityIssues(skill, getHarness("codex")).some((issue) => issue.message.includes("disable-model-invocation") && issue.severity === "warning"));
	assert.ok(!getCompatibilityIssues(skill, getHarness("claude-code")).some((issue) => issue.message.includes("not verified as supported")));
	assert.equal(JSON.stringify(skill), original);
});

test("known invalid harness metadata blocks compatibility while unknown metadata warns", () => {
	assert.ok(getCompatibilityIssues(fixture('disable-model-invocation: "maybe"\n'), getHarness("claude-code")).some((issue) => issue.severity === "error"));
	assert.ok(getCompatibilityIssues(fixture("custom-extension: yes\n"), getHarness("codex")).some((issue) => issue.severity === "warning" && issue.message.includes("custom-extension")));
	assert.ok(getCompatibilityIssues(fixture("metadata: text\n"), getHarness("codex")).some((issue) => issue.severity === "error"));
});

test("current Copilot allowed-tools support remains distinct from Codex", () => {
	const skill = fixture("license: MIT\nallowed-tools: shell\n");
	assert.ok(!getCompatibilityIssues(skill, getHarness("github-copilot")).some((issue) => issue.message.includes("not verified as supported")));
	assert.ok(getCompatibilityIssues(skill, getHarness("github-copilot")).some((issue) => issue.message.includes("permissions")));
	assert.ok(getCompatibilityIssues(skill, getHarness("codex")).some((issue) => issue.message.includes("allowed-tools") && issue.message.includes("not verified")));
});

test("script runtimes, OpenAI configuration, and Claude substitutions get actionable warnings", () => {
	const skill = fixture("", "Read $ARGUMENTS and execute !`pwd`.");
	skill.files.push({ path: "scripts/check.py", content: "import imaginary_dependency", encoding: "utf8" }, { path: "agents/openai.yaml", content: "policy:\n  allow_implicit_invocation: false", encoding: "utf8" });
	const messages = getCompatibilityIssues(skill, getHarness("github-copilot")).map((issue) => issue.message).join("\n");
	assert.match(messages, /Claude-specific/);
	assert.match(messages, /agents\/openai.yaml/);
	assert.match(messages, /runtime dependencies/);
	assert.match(messages, /no scripts are executed/);
});

test("verified Cursor metadata supports scoping, explicit invocation, and Custom Modes", () => {
	const skill = fixture('paths: ["**/*.tsx", "packages/ui/**/*.ts"]\ndisable-model-invocation: true\nicon: beaker\ncolor: green\nmetadata:\n  category: testing\n');
	const original = JSON.stringify(skill);
	assert.deepEqual(getCompatibilityIssues(skill, getHarness("cursor")), []);
	assert.equal(getHarness("cursor").documentationUrl, "https://cursor.com/docs/skills");
	assert.equal(JSON.stringify(skill), original);
	assert.ok(getCompatibilityIssues(skill, getHarness("codex")).some((issue) => issue.message.includes("paths") && issue.message.includes("not verified")));
});

test("Cursor validates documented scoping and mapping types while preserving legacy fallbacks", () => {
	assert.ok(getCompatibilityIssues(fixture("paths: 42\n"), getHarness("cursor")).some((issue) => issue.severity === "error"));
	assert.ok(getCompatibilityIssues(fixture("metadata: not-a-map\n"), getHarness("cursor")).some((issue) => issue.severity === "error"));
	assert.ok(getCompatibilityIssues(fixture('disable-model-invocation: "true"\n'), getHarness("cursor")).some((issue) => issue.severity === "error"));
	assert.ok(getCompatibilityIssues(fixture('globs: "**/*.py"\n'), getHarness("cursor")).some((issue) => issue.severity === "warning" && issue.message.includes("legacy")));
	assert.ok(getCompatibilityIssues(fixture("color: unknown-color\n"), getHarness("cursor")).some((issue) => issue.severity === "warning" && issue.message.includes("default badge")));
});

test("current Claude metadata includes portable fields and accepts its documented boolean spellings", () => {
	const skill = fixture('when_to_use: Before merging\narguments: [branch]\npaths: "**/*.ts"\nshell: bash\nlicense: MIT\ncompatibility: Requires Node.js\nmetadata:\n  category: testing\ndisable-model-invocation: "ON"\nuser-invocable: 1\nbackground: no\n');
	assert.ok(!getCompatibilityIssues(skill, getHarness("claude-code")).some((issue) => issue.severity === "error" || issue.message.includes("not verified as supported")));
});

test("uninstalled prompt uses exact destinations without claiming installation", () => {
	for (const harness of HARNESSES) {
		const prompt = generatePrompt([fixture()], harness, "Fix the authentication regression.", false);
		assert.ok(prompt.includes(`${harness.skillRoot}/testing/SKILL.md`));
		assert.match(prompt, /Installation is required first/);
		assert.match(prompt, /not a claim that the skills are already installed/);
		assert.ok(!prompt.includes("I have confirmed"));
		assert.match(prompt, /Fix the authentication regression/);
	}
});

test("installation assertion still requires the agent to verify its checkout", () => {
	const prompt = generatePrompt([fixture()], getHarness("codex"), "Investigate failures", true);
	assert.match(prompt, /I have confirmed/);
	assert.match(prompt, /verify the paths exist in your current task checkout/);
	assert.equal(CODEX_WEB_URL, "https://chatgpt.com/codex");
	assert.ok(!CODEX_WEB_URL.includes("?"));
});
