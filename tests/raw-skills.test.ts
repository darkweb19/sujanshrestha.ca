import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GET } from "../app/lab/skills/[slug]/skills.md/route";
import { putSkill } from "../lib/db/catalog";
import { migrate, openDatabase } from "../lib/db/connection";
import { rawSkillId, rawSkillPath, rawSkillUrl } from "../lib/skills-toolkit/skill-links";
import { parseSkillFiles } from "../lib/skills-toolkit/validation";

const directory = mkdtempSync(join(tmpdir(), "portfolio-raw-skills-test-"));
process.env.SQLITE_PATH = join(directory, "portfolio.sqlite");
const db = openDatabase({ initialize: true });
migrate(db);
const source = (description: string) => `---\r\nname: raw-source\r\ndescription: ${description}\r\n---\r\n# Café — 技能\r\n\r\n<example> & exact source\r\n`;
for (const managed of [true, false]) {
	const content = source(managed ? "Managed source." : "Owner source.");
	putSkill(db, parseSkillFiles([{ path: "SKILL.md", encoding: "utf8", content }], { kind: "local", label: "Test fixture" }), { managed });
}
db.close();
after(() => rmSync(directory, { recursive: true, force: true }));
const request = (slug: string) => GET(new Request("https://sujanshrestha.ca/lab/skills/example/skills.md"), { params: Promise.resolve({ slug }) });

test("raw endpoint returns exact UTF-8 Markdown, without authentication or HTML", async () => {
	const response = await request("raw-source");
	assert.equal(response.status, 200);
	assert.equal(response.headers.get("content-type"), "text/markdown; charset=utf-8");
	assert.equal(response.headers.get("access-control-allow-origin"), "*");
	assert.equal(response.headers.get("x-content-type-options"), "nosniff");
	assert.equal(response.headers.get("cache-control"), "no-store");
	assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new TextEncoder().encode(source("Managed source.")));
});

test("uploaded same-slug skills have distinct stable source links", async () => {
	assert.equal(rawSkillPath({ id: "upstream:raw-source", slug: "raw-source" }), "/lab/skills/raw-source/skills.md");
	assert.equal(rawSkillUrl({ id: "user:raw-source", slug: "raw-source" }), "https://sujanshrestha.ca/lab/skills/user%3Araw-source/skills.md");
	assert.equal(rawSkillUrl({ id: "upstream:raw-source", slug: "raw-source" }, "http://localhost:3000"), "http://localhost:3000/lab/skills/raw-source/skills.md");
	assert.equal(await (await request("user:raw-source")).text(), source("Owner source."));
	assert.equal(await (await request("upstream:raw-source")).text(), source("Managed source."));
});

test("unknown, traversal and malformed skill routes return plain 404s", async () => {
	for (const slug of ["missing", "../raw-source", "raw-source/extra", "%2e%2e", "RAW-source", "local:raw-source", "a".repeat(65), ""]) {
		const response = await request(slug);
		assert.equal(response.status, 404, slug);
		assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
		assert.equal(await response.text(), "Skill not found.\n");
	}
	assert.equal(rawSkillId("user:raw-source"), "user:raw-source");
	assert.throws(() => rawSkillPath({ id: "user:raw-source", slug: "other-source" }), /Invalid skill link/);
});

test("database failure returns a retryable plain response without leaking internals", async () => {
	const previous = process.env.SQLITE_PATH;
	process.env.SQLITE_PATH = join(directory, "missing.sqlite");
	try {
		const response = await request("raw-source");
		assert.equal(response.status, 503);
		assert.equal(await response.text(), "The skill library is unavailable. Please try again later.\n");
	} finally { process.env.SQLITE_PATH = previous; }
});
