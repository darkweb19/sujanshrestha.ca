import { BUILTIN_SKILLS, BUILTIN_SKILL_MANIFEST } from "./catalog-data";
import { parseSkillFiles } from "./validation";
import type { SkillFile, SkillPackage } from "./types";

export { BUILTIN_SKILLS, BUILTIN_SKILL_MANIFEST } from "./catalog-data";
export type { BuiltinSkillManifest } from "./catalog-data";

const pending = new Map<string, Promise<SkillPackage>>();
const maxPackageBytes = 2 * 1024 * 1024;

/** Fetch all original supporting files on demand; metadata alone is never exportable. */
export function loadBuiltinSkill(slug: string): Promise<SkillPackage> {
	const metadata = BUILTIN_SKILLS.find((skill) => skill.slug === slug);
	if (!metadata) return Promise.reject(new Error("Unknown built-in skill."));
	const cached = pending.get(slug);
	if (cached) return cached;
	const request = (async () => {
		const response = await fetch(`/skills-toolkit/${encodeURIComponent(slug)}.json`, { signal: AbortSignal.timeout(20_000) });
		if (!response.ok) throw new Error(`Could not load ${metadata.name}. Try again.`);
		if (Number(response.headers.get("content-length")) > maxPackageBytes) throw new Error("Built-in skill package exceeds the size limit.");
		const body = await response.text();
		if (new TextEncoder().encode(body).length > maxPackageBytes) throw new Error("Built-in skill package exceeds the size limit.");
		const data: unknown = JSON.parse(body);
		if (!data || typeof data !== "object" || !("files" in data) || !Array.isArray(data.files)) throw new Error("Invalid built-in skill package.");
		const files: SkillFile[] = data.files.map((file: unknown) => {
			if (!file || typeof file !== "object" || !("path" in file) || !("content" in file) || !("encoding" in file) || typeof file.path !== "string" || typeof file.content !== "string" || (file.encoding !== "utf8" && file.encoding !== "base64")) throw new Error("Invalid built-in supporting file.");
			return { path: file.path, content: file.content, encoding: file.encoding };
		});
		const expected = BUILTIN_SKILL_MANIFEST[slug];
		if (files.length !== expected.fileCount || files.some((file) => !expected.paths.includes(file.path))) throw new Error("Incomplete built-in skill package. Reload and try again.");
		const parsed = parseSkillFiles(files, metadata.source);
		if (parsed.slug !== slug) throw new Error("Built-in skill name does not match its package.");
		return { ...metadata, files: parsed.files };
	})();
	pending.set(slug, request);
	void request.catch(() => pending.delete(slug));
	return request;
}
