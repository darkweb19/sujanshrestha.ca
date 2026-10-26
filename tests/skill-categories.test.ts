import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { skillCategory } from "../lib/skills-toolkit/categories";
import { getSkill, listSkills, putSkill } from "../lib/db/catalog";
import { migrate, openDatabase } from "../lib/db/connection";
import { parseSkillFiles } from "../lib/skills-toolkit/validation";

const directory = mkdtempSync(join(tmpdir(), "portfolio-category-test-"));
process.env.SQLITE_PATH = join(directory, "portfolio.sqlite");
const db = openDatabase({ initialize: true }); migrate(db);
after(() => { db.close(); rmSync(directory, { recursive: true, force: true }); });

test("uncategorized skills receive useful folders; explicit custom categories survive", () => {
	assert.equal(skillCategory("senior-frontend", "Imported"), "Engineering");
	assert.equal(skillCategory("ui-design-system", "Imported"), "Design");
	assert.equal(skillCategory("aws-solution-architect", "Imported"), "Infrastructure");
	assert.equal(skillCategory("database-designer", "Imported"), "Data & AI");
	assert.equal(skillCategory("seo-audit", "marketing"), "Marketing");
	assert.equal(skillCategory("custom-skill", "Owner category"), "Owner category");
});

test("folder filters include all matching skills with correct totals and pagination without changing source bytes", () => {
	for (const slug of ["a11y-audit", "ui-design-system", "senior-frontend"]) {
		const content = `---\nname: ${slug}\ndescription: Category fixture.\n---\n# Original source\n`;
		putSkill(db, parseSkillFiles([{ path: "SKILL.md", encoding: "utf8", content }], { kind: "local", label: "fixture" }), { managed: true });
	}
	const first = listSkills({ category: "Design", pageSize: 1 }, db);
	const second = listSkills({ category: "Design", pageSize: 1, page: 2 }, db);
	assert.equal(first.total, 2); assert.equal(second.total, 2);
	assert.notEqual(first.skills[0].id, second.skills[0].id);
	assert.deepEqual(first.categories, ["Design", "Engineering"]);
	assert.equal(listSkills({ q: "senior", category: "Design" }, db).total, 0);
	assert.match(getSkill("upstream:a11y-audit", db)!.files[0].content, /# Original source\n$/);
	assert.doesNotMatch(getSkill("upstream:a11y-audit", db)!.files[0].content, /category:/);
});
