export interface SkillFile {
	path: string;
	content: string;
	encoding: "utf8" | "base64";
}

export interface SkillSource {
	kind: "builtin" | "local" | "github";
	label: string;
	url?: string;
}

export interface SkillPackage {
	id: string;
	slug: string;
	name: string;
	description: string;
	category: string;
	source: SkillSource;
	files: SkillFile[];
	importedAt?: string;
}

export interface ValidationIssue {
	severity: "error" | "warning";
	message: string;
	path?: string;
}

export type HarnessId = "codex" | "claude-code" | "cursor" | "github-copilot";

export interface HarnessAdapter {
	id: HarnessId;
	name: string;
	description: string;
	skillRoot: string;
	instructions: string[];
	supportsSupportingFiles: boolean;
	rootDirectory: string;
	supportedMetadata: string[];
	supportedStructure: string[];
	validationRequirements: string[];
	exportBehavior: string;
	installationInstructions: string[];
	documentationUrl: string;
}

export const ARCHIVE_LIMITS = {
	maxCompressedBytes: 10 * 1024 * 1024,
	maxUncompressedBytes: 25 * 1024 * 1024,
	maxFileBytes: 2 * 1024 * 1024,
	maxFiles: 256,
	maxPathLength: 240,
} as const;
