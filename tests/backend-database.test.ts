import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backup } from "node:sqlite";
import { checkedPackage, checkedUserPackage, deleteUserSkill, getSkill, importUserSkills, listSkills, putSkill, updateUserSkill } from "../lib/db/catalog";
import { migrate, openDatabase, transaction } from "../lib/db/connection";
import { parseSkillFiles } from "../lib/skills-toolkit/validation";

const directory = mkdtempSync(join(tmpdir(), "portfolio-db-test-"));
process.env.SQLITE_PATH = join(directory, "portfolio.sqlite");
const connection = openDatabase({ initialize: true }); migrate(connection); connection.close();
after(() => rmSync(directory, { recursive: true, force: true }));
const skill = (slug: string, description = "A complete test package.") => parseSkillFiles([
	{ path: "SKILL.md", encoding: "utf8", content: `---\nname: ${slug}\ndescription: ${description}\n---\n# ${slug}\n` },
	{ path: "references/example.md", encoding: "utf8", content: "Complete original reference.\n" },
	{ path: "assets/sample.bin", encoding: "base64", content: "AAEC/w==" },
	{ path: "scripts/example.js", encoding: "utf8", content: "throw new Error('Imported scripts must never run');" },
], { kind: "local", label: "Test fixture" });

test("migrations are repeatable; file bytes and inert scripts survive closing and reopening SQLite", () => {
	const db = openDatabase(); migrate(db); migrate(db); db.close();
	const [saved] = importUserSkills([skill("persistent-test")]);
	const reloaded = getSkill(saved.id)!;
	assert.deepEqual([...reloaded.files].sort((a, b) => a.path.localeCompare(b.path)), skill("persistent-test").files.sort((a, b) => a.path.localeCompare(b.path)));
	assert.equal(reloaded.id, "user:persistent-test");
	assert.equal(reloaded.revision, 1);
	assert.equal(reloaded.managed, false);
});

test("public metadata query searches, clamps pagination, filters categories and never includes file bodies", () => {
	const result = listSkills({ q: "persistent", page: 999, pageSize: 1 });
	assert.equal(result.total, 1); assert.equal(result.page, 1);
	assert.equal(result.skills[0].fileCount, 4);
	assert.equal("files" in result.skills[0], false);
	assert.equal(listSkills({ q: "%" }).total, 0);
	assert.equal(listSkills({ category: "Missing" }).total, 0);
});

test("whole import batches roll back on duplicates rather than partially persisting", () => {
	assert.throws(() => importUserSkills([skill("rollback-first"), skill("persistent-test")]), /already exists/);
	assert.equal(getSkill("user:rollback-first"), null);
});

test("managed and uploaded namespaces stay separate and sync is idempotent", () => {
	const db = openDatabase();
	try {
		assert.equal(transaction(db, () => putSkill(db, skill("persistent-test"), { managed: true, sourceCommit: "a".repeat(40) })), "inserted");
		assert.equal(transaction(db, () => putSkill(db, skill("persistent-test"), { managed: true, sourceCommit: "a".repeat(40) })), "unchanged");
	} finally { db.close(); }
	assert.equal(getSkill("upstream:persistent-test")!.revision, 1);
	assert.equal(getSkill("user:persistent-test")!.managed, false);
	assert.throws(() => updateUserSkill("upstream:persistent-test", skill("persistent-test").files, 1), /cannot be edited/);
	assert.throws(() => deleteUserSkill("upstream:persistent-test", 1), /cannot be removed/);
});

test("edits and deletes reject stale revisions and preserve the current package", () => {
	const previous = getSkill("user:persistent-test")!;
	const updated = updateUserSkill(previous.id, skill("persistent-test", "Updated description.").files, previous.revision);
	assert.equal((updated as { revision?: number }).revision, 2);
	assert.throws(() => updateUserSkill(previous.id, previous.files, previous.revision), /changed/);
	assert.throws(() => deleteUserSkill(previous.id, previous.revision), /changed/);
	assert.equal(getSkill(previous.id)!.description, "Updated description.");
	deleteUserSkill(previous.id, 2); assert.equal(getSkill(previous.id), null);
});

test("untrusted upload metadata is reparsed; unsafe paths, aliases and binary SKILL.md reject", () => {
	assert.equal(checkedPackage({ ...skill("metadata-check"), description: "Forged metadata" }, { kind: "local", label: "fixture" }).description, "A complete test package.");
	const unsafe = skill("unsafe-path"); unsafe.files.push({ path: "../outside", content: "bad", encoding: "utf8" });
	assert.throws(() => checkedPackage(unsafe, unsafe.source), /traversal/);
	assert.throws(() => checkedPackage({ files: [{ path: "SKILL.md", encoding: "base64", content: "AAEC" }] }, unsafe.source), /UTF-8/);
	assert.throws(() => checkedPackage({ files: [{ path: "SKILL.md", encoding: "utf8", content: "---\nname: test\ndescription: &desc hello\ncategory: *desc\n---\n" }] }, unsafe.source), /aliases/);
});

test("legacy owner imports preserve safe provenance and reject managed ownership claims", () => {
	const value = skill("source-provenance");
	value.source = { kind: "github", label: "Original public GitHub source", url: "https://github.com/example/skills/tree/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/source-provenance" };
	assert.deepEqual(checkedUserPackage(value).source, value.source);
	assert.throws(() => checkedUserPackage({ ...value, source: { kind: "builtin", label: "Forged upstream" } }), /source metadata/);
	assert.throws(() => checkedUserPackage({ ...value, source: { ...value.source, url: "https://user:secret@github.com/example/skills" } }), /source URL/);
});

test("SQLite backup API produces a consistent independently readable database", async () => {
	const db = openDatabase(); const path = join(directory, "backup.sqlite");
	try { await backup(db, path); } finally { db.close(); }
	const restored = openDatabase({ path });
	try { assert.equal(getSkill("upstream:persistent-test", restored)!.slug, "persistent-test"); assert.equal(restored.prepare("PRAGMA integrity_check").get()!["integrity_check"], "ok"); }
	finally { restored.close(); }
});
