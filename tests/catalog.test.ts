import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { BUILTIN_SKILLS, BUILTIN_SKILL_MANIFEST, loadBuiltinSkill } from "../lib/skills-toolkit/catalog";
import { parseSkillFiles, skillFileBytes, validateSkillPackage } from "../lib/skills-toolkit/validation";
import type { SkillPackage } from "../lib/skills-toolkit/types";

const root = process.cwd();
const readPackage = async (slug: string): Promise<SkillPackage> => JSON.parse(await readFile(resolve(root, `public/skills-toolkit/${slug}.json`), "utf8"));

test("catalog includes all ten requested skills as lightweight metadata", () => {
	assert.deepEqual(BUILTIN_SKILLS.map((skill) => skill.name), ["Frontend Design", "CTO Advisor", "Code Review", "Debugging", "Security Audit", "Testing", "API Design", "Performance Optimization", "Documentation", "Database Architecture"]);
	assert.equal(new Set(BUILTIN_SKILLS.map((skill) => skill.slug)).size, 10);
	for (const skill of BUILTIN_SKILLS) {
		assert.deepEqual(skill.files, []);
		assert.ok(BUILTIN_SKILL_MANIFEST[skill.slug].paths.includes("SKILL.md"));
	}
});

test("all static packages validate and every original source file matches its pinned checksum", async () => {
	const provenance = JSON.parse(await readFile(resolve(root, "data/skills-toolkit/source-checksums.json"), "utf8")) as { repository: string; commit: string; files: Record<string, { bytes: number; sha256: string }> };
	let originalFileCount = 0;
	for (const metadata of BUILTIN_SKILLS) {
		const skill = await readPackage(metadata.slug);
		assert.equal(parseSkillFiles(skill.files, skill.source).slug, skill.slug);
		assert.deepEqual(validateSkillPackage(skill).filter((issue) => issue.severity === "error"), [], skill.slug);
		const manifest = BUILTIN_SKILL_MANIFEST[skill.slug];
		assert.equal(skill.files.length, manifest.fileCount);
		assert.deepEqual(skill.files.map((file) => file.path), manifest.paths);
		assert.equal(skill.files.reduce((sum, file) => sum + skillFileBytes(file).length, 0), manifest.byteSize);
		assert.equal(skill.source.url, `${provenance.repository}/tree/${provenance.commit}/${skill.slug}`);
		assert.match(skill.files.find((file) => file.path === "SOURCE-LICENSE-APACHE-2.0.txt")!.content, /Apache License/);
		assert.ok(skill.files.find((file) => file.path === "SOURCE-ATTRIBUTION.md")!.content.includes(skill.source.url));
		for (const [path, expected] of Object.entries(provenance.files).filter(([path]) => path.startsWith(`${skill.slug}/`))) {
			const file = skill.files.find((item) => item.path === path.slice(skill.slug.length + 1));
			assert.ok(file, `Missing original file: ${path}`);
			const bytes = skillFileBytes(file);
			assert.equal(bytes.length, expected.bytes, path);
			assert.equal(createHash("sha256").update(bytes).digest("hex"), expected.sha256, path);
			originalFileCount++;
		}
	}
	assert.equal(originalFileCount, 96);
});

test("lazy loading returns a complete package, rejects partial responses, and retries failures", async () => {
	const originalFetch = globalThis.fetch;
	let calls = 0;
	const [metadata] = BUILTIN_SKILLS;
	const skill = await readPackage(metadata.slug);
	globalThis.fetch = async () => {
		calls++;
		return Response.json(calls === 1 ? { files: skill.files.slice(0, 1) } : skill);
	};
	try {
		await assert.rejects(loadBuiltinSkill(metadata.slug), /Incomplete built-in/);
		const loaded = await loadBuiltinSkill(metadata.slug);
		assert.deepEqual(loaded.files, skill.files);
		assert.equal((await loadBuiltinSkill(metadata.slug)).files.length, skill.files.length);
		assert.equal(calls, 2);
		await assert.rejects(loadBuiltinSkill("not-a-real-skill"), /Unknown built-in/);
	} finally { globalThis.fetch = originalFetch; }
});

test("lazy loading bounds responses and passes a timeout signal", async () => {
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async (_url, options) => {
		assert.ok(options?.signal instanceof AbortSignal);
		return new Response("{}", { headers: { "content-length": String(2 * 1024 * 1024 + 1) } });
	};
	try { await assert.rejects(loadBuiltinSkill(BUILTIN_SKILLS[1].slug), /size limit/); }
	finally { globalThis.fetch = originalFetch; }
});
