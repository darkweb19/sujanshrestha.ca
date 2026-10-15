import { parseDocument } from "yaml";
import { ARCHIVE_LIMITS, type HarnessAdapter, type SkillFile, type SkillPackage, type SkillSource, type ValidationIssue } from "./types";

const encoder = new TextEncoder();
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateArchivePath(path: string): string | null {
	if (!path || path.length > ARCHIVE_LIMITS.maxPathLength) return "File path is empty or too long.";
	if (path.startsWith("/") || /^[a-zA-Z]:/.test(path) || path.includes("\\")) return "Absolute paths and backslashes are not allowed.";
	if (/[\u0000-\u001f\u007f]/.test(path)) return "Control characters are not allowed in file paths.";
	if (path.split("/").some((part) => !part || part === "." || part === "..")) return "Empty segments and path traversal are not allowed.";
	if (/[<>:"|?*]/.test(path)) return "Paths must not contain reserved Windows filename characters or alternate data streams.";
	if (path.split("/").some((part) => /[. ]$/.test(part) || /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(part))) return "Reserved device filenames and names ending in a dot or space are not allowed.";
	return null;
}

export function canonicalArchivePath(path: string): string {
	return path.normalize("NFC").toLowerCase();
}

export function skillFileBytes(file: SkillFile): Uint8Array {
	if (file.encoding === "utf8") return encoder.encode(file.content);
	if (file.encoding !== "base64" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content)) {
		throw new Error(`Invalid base64 file: ${file.path}`);
	}
	return Uint8Array.from(atob(file.content), (character) => character.charCodeAt(0));
}

export function bytesToSkillFile(path: string, bytes: Uint8Array): SkillFile {
	try {
		const content = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
		if (!content.includes("\0")) return { path, content, encoding: "utf8" };
	} catch { /* Binary supporting files are retained byte-for-byte. */ }
	let binary = "";
	for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
	return { path, content: btoa(binary), encoding: "base64" };
}

function readFrontmatter(file: SkillFile): { name: string; description: string; category: string } {
	if (file.encoding !== "utf8") throw new Error("SKILL.md must contain UTF-8 text.");
	const match = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(file.content);
	if (!match) throw new Error("SKILL.md must start with YAML frontmatter between --- lines.");
	const document = parseDocument(match[1], { schema: "core", uniqueKeys: true, strict: true });
	if (document.errors.length || document.warnings.length) throw new Error(`Invalid SKILL.md frontmatter: ${(document.errors[0] ?? document.warnings[0]).message}`);
	let metadata: unknown;
	try { metadata = document.toJS({ maxAliasCount: 0 }); }
	catch { throw new Error("YAML aliases are not supported in SKILL.md frontmatter."); }
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("SKILL.md frontmatter must be a YAML mapping.");
	const fields = metadata as Record<string, unknown>;
	if (typeof fields.name !== "string" || fields.name.length > 64 || !slugPattern.test(fields.name)) throw new Error("Skill name must be a lowercase slug of 1–64 characters with single hyphens.");
	if (typeof fields.description !== "string" || !fields.description.trim() || fields.description.length > 1024) throw new Error("Skill description must contain 1–1024 characters.");
	const extra = fields.metadata && typeof fields.metadata === "object" ? fields.metadata as Record<string, unknown> : {};
	const category = typeof fields.category === "string" ? fields.category : typeof extra.category === "string" ? extra.category : "Imported";
	return { name: fields.name, description: fields.description.trim(), category };
}

export function validateSkillPackage(skill: SkillPackage): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const error = (message: string, path?: string) => issues.push({ severity: "error", message, ...(path ? { path } : {}) });
	if (!slugPattern.test(skill.slug) || skill.slug.length > 64) error("Skill folder must use a lowercase slug of 1–64 characters.");
	if (!skill.files.length || skill.files.length > ARCHIVE_LIMITS.maxFiles) error(`Each skill needs 1–${ARCHIVE_LIMITS.maxFiles} files.`);
	const seen = new Set<string>();
	let totalBytes = 0;
	for (const file of skill.files) {
		const unsafe = validateArchivePath(file.path);
		if (unsafe) error(unsafe, file.path);
		const key = canonicalArchivePath(file.path);
		if (seen.has(key)) error("Duplicate file path or case-insensitive collision.", file.path);
		seen.add(key);
		if (file.path !== "SKILL.md" && /(?:^|\/)SKILL\.md$/i.test(file.path)) error("Nested skill packages are not supported; import each skill separately.", file.path);
		try {
			const size = skillFileBytes(file).length;
			totalBytes += size;
			if (size > ARCHIVE_LIMITS.maxFileBytes) error("File exceeds the 2 MB limit.", file.path);
		} catch (cause) { error((cause as Error).message, file.path); }
	}
	for (const file of skill.files) {
		const segments = canonicalArchivePath(file.path).split("/");
		for (let count = 1; count < segments.length; count++) {
			if (seen.has(segments.slice(0, count).join("/"))) error("A file path collides with a parent directory.", file.path);
		}
	}
	if (totalBytes > ARCHIVE_LIMITS.maxUncompressedBytes) error("Skill exceeds the 25 MB uncompressed limit.");
	const entry = skill.files.find((file) => file.path === "SKILL.md");
	if (!entry) error("A root SKILL.md file is required.");
	else {
		try {
			const metadata = readFrontmatter(entry);
			if (metadata.name !== skill.slug) error("SKILL.md name must match the skill folder slug.", "SKILL.md");
		} catch (cause) { error((cause as Error).message, "SKILL.md"); }
	}
	for (const file of skill.files.filter((item) => item.encoding === "utf8" && /\.md$/i.test(item.path))) {
		for (const match of file.content.matchAll(/\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+["'][^)]*)?\)/g)) {
			const target = match[1].split(/[?#]/)[0];
			if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("//")) continue;
			let decoded: string;
			try { decoded = decodeURIComponent(target); } catch { issues.push({ severity: "warning", message: "Invalid encoded supporting-file reference.", path: file.path }); continue; }
			if (decoded.startsWith("/") || decoded.includes("\\") || /[\u0000-\u001f\u007f]/.test(decoded)) { issues.push({ severity: "warning", message: `Reference may require a workspace path outside this skill: ${target}`, path: file.path }); continue; }
			const segments = file.path.split("/").slice(0, -1);
			let escaped = false;
			for (const segment of decoded.split("/")) {
				if (segment === "..") { if (!segments.length) escaped = true; else segments.pop(); }
				else if (segment && segment !== ".") segments.push(segment);
			}
			if (escaped) issues.push({ severity: "warning", message: `Reference points outside this skill and may need another installed skill: ${target}`, path: file.path });
			else if (!seen.has(canonicalArchivePath(segments.join("/")))) issues.push({ severity: "warning", message: `Referenced file is missing: ${target}`, path: file.path });
		}
	}
	return issues;
}

export function parseSkillFiles(files: SkillFile[], source: SkillSource): SkillPackage {
	const entry = files.find((file) => file.path === "SKILL.md");
	if (!entry) throw new Error("A root SKILL.md file is required.");
	const metadata = readFrontmatter(entry);
	const skill: SkillPackage = { id: `${source.kind}:${metadata.name}`, slug: metadata.name, name: metadata.name, description: metadata.description, category: metadata.category, source, files, ...(source.kind !== "builtin" ? { importedAt: new Date().toISOString() } : {}) };
	const errors = validateSkillPackage(skill).filter((issue) => issue.severity === "error");
	if (errors.length) throw new Error(errors.map((issue) => `${issue.path ? `${issue.path}: ` : ""}${issue.message}`).join(" "));
	return skill;
}

export function validateSelection(skills: SkillPackage[], harness?: HarnessAdapter): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	if (!skills.length) issues.push({ severity: "error", message: "Select at least one skill to export." });
	const slugs = new Set<string>();
	let fileCount = 0;
	let totalBytes = 0;
	for (const skill of skills) {
		issues.push(...validateSkillPackage(skill));
		if (slugs.has(skill.slug.toLowerCase())) issues.push({ severity: "error", message: `Two selected skills use the folder “${skill.slug}”. Choose one to prevent overwriting files.` });
		slugs.add(skill.slug.toLowerCase());
		fileCount += skill.files.length;
		for (const file of skill.files) { try { totalBytes += skillFileBytes(file).length; } catch { /* Reported by package validation. */ } }
		if (harness && !harness.supportsSupportingFiles && skill.files.length > 1) issues.push({ severity: "error", message: `${harness.name} does not support this skill’s supporting files.` });
	}
	if (fileCount > ARCHIVE_LIMITS.maxFiles) issues.push({ severity: "error", message: "Selection exceeds the 256-file export limit." });
	if (totalBytes > ARCHIVE_LIMITS.maxUncompressedBytes) issues.push({ severity: "error", message: "Selection exceeds the 25 MB export limit." });
	if (harness && validateArchivePath(harness.skillRoot)) issues.push({ severity: "error", message: "Harness skill root is unsafe." });
	return issues;
}
