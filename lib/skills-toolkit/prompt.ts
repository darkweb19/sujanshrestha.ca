import type { HarnessAdapter, SkillPackage } from "./types";

export const CODEX_WEB_URL = "https://chatgpt.com/codex";

/** The boolean is an explicit user assertion, never inferred from downloading. */
export function generatePrompt(skills: SkillPackage[], harness: HarnessAdapter, requirements: string, installed: boolean): string {
	const paths = skills.map((skill) => `- \`${harness.skillRoot}/${skill.slug}/SKILL.md\``).join("\n");
	const installation = installed
		? "I have confirmed these skill files are installed in the target repository. Before using them, verify the paths exist in your current task checkout and read the selected instructions. If any are missing, stop and explain the installation needed."
		: `Installation is required first: extract the downloaded skills ZIP into the target repository root, preserving \`${harness.skillRoot}/\`. The paths below are intended installation destinations, not a claim that the skills are already installed. Verify the files exist in your task checkout before reading or using them. If they are absent, explain what must be installed and do not claim you have used the skills.`;
	return [
		`# Task for ${harness.name}`,
		requirements.trim() || "Describe the task requirements here.",
		"## Skill installation",
		installation,
		"## Selected skill files",
		paths || "No skills selected. Continue using the repository’s existing instructions.",
		"## Working instructions",
		"Apply the selected skills when relevant to this task. Follow repository instructions and user requirements. Resolve conflicting skill guidance explicitly. Read referenced supporting resources as needed; inspect scripts before execution and confirm dependencies and permissions in this environment. Do not invent installed tools, credentials, successful checks, or completed work. Summarize changes, validation results, and remaining blockers.",
	].join("\n\n");
}
