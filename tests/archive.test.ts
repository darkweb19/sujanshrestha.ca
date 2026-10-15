import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, unzipSync, zipSync } from "fflate";
import { generateSkillZip, importSkillZip } from "../lib/skills-toolkit/archive";
import { HARNESSES } from "../lib/skills-toolkit/harnesses";
import { ARCHIVE_LIMITS, type SkillSource } from "../lib/skills-toolkit/types";
import { bytesToSkillFile, parseSkillFiles, skillFileBytes, validateSelection, validateSkillPackage } from "../lib/skills-toolkit/validation";

const source: SkillSource = { kind: "local", label: "Test upload" };
const document = (name = "sample-skill", body = "Follow the instructions.") => `---\nname: ${name}\ndescription: A complete, reusable test skill.\n---\n\n# Instructions\n${body}\n`;
const skill = (name = "sample-skill") => parseSkillFiles([
	{ path: "SKILL.md", content: document(name, "Read [the reference](references/guide.md)."), encoding: "utf8" },
	{ path: "references/guide.md", content: "# Reference\nUseful guidance.", encoding: "utf8" },
	{ path: "scripts/run.sh", content: "#!/bin/sh\necho do-not-execute\n", encoding: "utf8" },
	bytesToSkillFile("assets/fixture.bin", new Uint8Array([0, 255, 16, 128, 1])),
], source);

const adapters = [
	["codex", ".agents/skills"],
	["claude-code", ".claude/skills"],
	["cursor", ".cursor/skills"],
	["github-copilot", ".github/skills"],
] as const;

const harness = (id: string, skillRoot: string) => {
	const adapter = HARNESSES.find((entry) => entry.id === id)!;
	assert.equal(adapter.skillRoot, skillRoot);
	return adapter;
};

for (const [id, root] of adapters) {
	test(`${id}: exports exact selected-only paths and retains all supporting bytes`, async () => {
		const selected = [skill("first-skill"), skill("second-skill")];
		const unselected = skill("not-selected");
		assert.equal(unselected.slug, "not-selected");
		const zip = await generateSkillZip(selected, harness(id, root));
		const output = unzipSync(zip);
		assert.deepEqual(Object.keys(output).sort(), selected.flatMap((item) => item.files.map((file) => `${root}/${item.slug}/${file.path}`)).sort());
		for (const item of selected) for (const file of item.files) assert.deepEqual(output[`${root}/${item.slug}/${file.path}`], skillFileBytes(file));
		assert.ok(Object.keys(output).every((path) => !path.includes(unselected.slug)));
		const imported = await importSkillZip(zip, source);
		assert.deepEqual(imported.map((item) => item.slug), selected.map((item) => item.slug));
		for (const item of imported) assert.deepEqual(item.files, selected.find((original) => original.slug === item.slug)!.files);
	});
}

test("imports a root skill and preserves UTF-8 and binary supporting files", async () => {
	const bytes = zipSync({ "SKILL.md": strToU8(document()), "assets/image.bin": new Uint8Array([0, 128, 255]), "references/日本語.md": strToU8("説明") });
	const [result] = await importSkillZip(bytes, source);
	assert.equal(result.slug, "sample-skill");
	assert.equal(result.source.kind, "local");
	assert.deepEqual(skillFileBytes(result.files.find((file) => file.path === "assets/image.bin")!), new Uint8Array([0, 128, 255]));
	assert.equal(result.files.find((file) => file.path === "references/日本語.md")!.content, "説明");
});

test("preserves UTF-8 BOM bytes in SKILL.md and supporting files across ZIP roundtrips", async () => {
	const original = {
		"SKILL.md": strToU8(`\uFEFF${document()}`),
		"references/bom.txt": strToU8("\uFEFFOriginal UTF-8 content"),
		"assets/binary.bin": new Uint8Array([0, 255, 128, 1]),
	};
	const [imported] = await importSkillZip(zipSync(original), source);
	const exported = unzipSync(await generateSkillZip([imported], harness("codex", ".agents/skills")));
	for (const [path, bytes] of Object.entries(original)) assert.deepEqual(exported[`.agents/skills/sample-skill/${path}`], bytes);
	const [reimported] = await importSkillZip(await generateSkillZip([imported], harness("codex", ".agents/skills")), source);
	for (const [path, bytes] of Object.entries(original)) assert.deepEqual(skillFileBytes(reimported.files.find((file) => file.path === path)!), bytes);
});

test("invalid UTF-8 remains binary and cannot be imported as SKILL.md", async () => {
	const invalid = new Uint8Array([...strToU8(document()), 0xc3, 0x28]);
	const file = bytesToSkillFile("SKILL.md", invalid);
	assert.equal(file.encoding, "base64");
	assert.deepEqual(skillFileBytes(file), invalid);
	await assert.rejects(importSkillZip(zipSync({ "SKILL.md": invalid }), source), /SKILL.md must contain UTF-8 text/);
});

test("rejects missing SKILL.md and malformed or incomplete metadata", async () => {
	await assert.rejects(importSkillZip(zipSync({ "README.md": strToU8("Nothing here") }), source), /No SKILL.md/);
	for (const content of ["No frontmatter", "---\nname: sample-skill\n---\n", "---\nname: Uppercase\ndescription: hi\n---\n", "---\nname: sample-skill\nname: another\ndescription: hi\n---\n", "---\nname: sample-skill\ndescription: !unsafe hi\n---\n", "---\nname: sample-skill\ndescription: &description hi\nother: *description\n---\n"]) {
		await assert.rejects(importSkillZip(zipSync({ "SKILL.md": strToU8(content) }), source), /frontmatter|description|slug|aliases/i);
	}
});

test("rejects selected duplicate directories and unsafe slug overrides", async () => {
	const original = skill();
	assert.ok(validateSelection([original, { ...original, id: "other" }]).some((issue) => issue.severity === "error" && /folder/.test(issue.message)));
	await assert.rejects(generateSkillZip([original, original], harness("codex", ".agents/skills")), /Two selected/);
	await assert.rejects(generateSkillZip([{ ...original, slug: "../escape" }], harness("codex", ".agents/skills")), /slug|folder/);
	await assert.rejects(generateSkillZip([], harness("codex", ".agents/skills")), /Select at least one/);
});

test("reports missing and cross-skill supporting references as warnings, rejects unsafe file entries", () => {
	const item = parseSkillFiles([{ path: "SKILL.md", content: document("sample-skill", "[Missing](references/missing.md) [Other](../other-skill/SKILL.md)"), encoding: "utf8" }], source);
	assert.equal(validateSkillPackage(item).filter((issue) => issue.severity === "warning").length, 2);
	assert.throws(() => parseSkillFiles([...item.files, { path: "../escape.sh", content: "bad", encoding: "utf8" }], source), /traversal/);
	assert.throws(() => parseSkillFiles([...item.files, { path: "skill.md", content: "duplicate", encoding: "utf8" }], source), /collision/);
	assert.throws(() => parseSkillFiles([...item.files, { path: "nested/SKILL.md", content: document("nested"), encoding: "utf8" }], source), /Nested/);
	const workspaceLinks = parseSkillFiles([{ path: "SKILL.md", content: document("workspace-links", "[Absolute](/docs/config) [Encoded](a%ZZ.md) [Windows](C%3A%5Cconfig.md)"), encoding: "utf8" }], source);
	assert.equal(validateSkillPackage(workspaceLinks).filter((issue) => issue.severity === "error").length, 0);
	assert.equal(validateSkillPackage(workspaceLinks).filter((issue) => issue.severity === "warning").length, 3);
});

for (const path of ["../escape", "/absolute", "C:/drive", "bad\\file", "a/../../escape", "a//file", "a/./file", "bad\u0000file", "bad\u001ffile", "file:alternate", "file.", "folder /file", "CON", "nul.txt", "LPT1.md", "COM2", "bad?name", "bad*name", "bad<name", "bad|name", "bad\"name"]) {
	test(`rejects unsafe ZIP path ${JSON.stringify(path)}`, async () => {
		await assert.rejects(importSkillZip(zipSync({ "SKILL.md": strToU8(document()), [path]: strToU8("bad") }), source), /Unsafe ZIP/);
	});
}

test("rejects case collisions, file-directory collisions, duplicate skill names and nested skills", async () => {
	await assert.rejects(importSkillZip(zipSync({ "SKILL.md": strToU8(document()), "skill.md": strToU8("collision") }), source), /case collision/);
	await assert.rejects(importSkillZip(zipSync({ "SKILL.md": strToU8(document()), "é.txt": strToU8("first"), "e\u0301.txt": strToU8("second") }), source), /case collision/);
	await assert.rejects(importSkillZip(zipSync({ "SKILL.md": strToU8(document()), "support": strToU8("file"), "support/a.md": strToU8("overlap") }), source), /paths collide/);
	await assert.rejects(importSkillZip(zipSync({ "first/SKILL.md": strToU8(document()), "second/SKILL.md": strToU8(document()) }), source), /Two selected/);
	await assert.rejects(importSkillZip(zipSync({ "SKILL.md": strToU8(document()), "nested/SKILL.md": strToU8(document("nested")) }), source), /Nested/);
	const original = skill();
	assert.throws(() => parseSkillFiles([...original.files, { path: "references", content: "parent file", encoding: "utf8" }], source), /parent directory/);
	assert.throws(() => parseSkillFiles([...original.files, { path: "é.txt", content: "first", encoding: "utf8" }, { path: "e\u0301.txt", content: "second", encoding: "utf8" }], source), /collision/);
});

function mutateHeaders(bytes: Uint8Array, mutate: (view: DataView, local: number, central: number, end: number) => void): Uint8Array {
	const copy = bytes.slice();
	const view = new DataView(copy.buffer);
	let central = -1;
	let end = -1;
	for (let offset = 0; offset + 4 <= copy.length; offset++) {
		if (view.getUint32(offset, true) === 0x02014b50 && central < 0) central = offset;
		if (view.getUint32(offset, true) === 0x06054b50) end = offset;
	}
	mutate(view, 0, central, end);
	return copy;
}

test("rejects encrypted, symlink, unsupported compression and multi-disk ZIP entries", async () => {
	const original = zipSync({ "SKILL.md": strToU8(document()) });
	const cases: [RegExp, Parameters<typeof mutateHeaders>[1]][] = [
		[/Encrypted/, (view, local, central) => { view.setUint16(local + 6, 1, true); view.setUint16(central + 8, 1, true); }],
		[/Symlinks/, (view, _local, central) => { view.setUint32(central + 38, 0xa1ff0000, true); }],
		[/stored and deflated/, (view, local, central) => { view.setUint16(local + 8, 99, true); view.setUint16(central + 10, 99, true); }],
		[/Multi-disk/, (view, _local, _central, end) => { view.setUint16(end + 4, 1, true); }],
	];
	for (const [message, mutation] of cases) await assert.rejects(importSkillZip(mutateHeaders(original, mutation), source), message);
});

test("rejects oversized compressed input, declared expansion bombs and excessive entry counts before decompression", async () => {
	await assert.rejects(importSkillZip(new Uint8Array(ARCHIVE_LIMITS.maxCompressedBytes + 1), source), /upload limit/);
	const original = zipSync({ "SKILL.md": strToU8(document()) });
	const bomb = mutateHeaders(original, (view, local, central) => { view.setUint32(local + 22, ARCHIVE_LIMITS.maxFileBytes + 1, true); view.setUint32(central + 24, ARCHIVE_LIMITS.maxFileBytes + 1, true); });
	await assert.rejects(importSkillZip(bomb, source), /2 MB file limit/);
	const tooMany = mutateHeaders(original, (view, _local, _central, end) => { view.setUint16(end + 8, 257, true); view.setUint16(end + 10, 257, true); });
	await assert.rejects(importSkillZip(tooMany, source), /256 entries/);
});

test("rejects checksum corruption, inconsistent headers, truncated archives and under-declared expansion", async () => {
	const original = zipSync({ "SKILL.md": strToU8(document()) });
	const corrupted = mutateHeaders(original, (view, local, central) => { view.setUint32(local + 14, 0, true); view.setUint32(central + 16, 0, true); });
	await assert.rejects(importSkillZip(corrupted, source), /checksum/);
	const inconsistent = mutateHeaders(original, (view, local) => view.setUint32(local + 22, 1, true));
	await assert.rejects(importSkillZip(inconsistent, source), /headers disagree/);
	await assert.rejects(importSkillZip(original.slice(0, -5), source), /end-of-directory/);
	const tooSmall = mutateHeaders(original, (view, local, central) => { view.setUint32(local + 22, 1, true); view.setUint32(central + 24, 1, true); });
	await assert.rejects(importSkillZip(tooSmall, source), /decompress/);
});
