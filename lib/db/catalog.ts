import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { SkillFile, SkillPackage, SkillSource } from "../skills-toolkit/types";
import { parseSkillFiles, skillFileBytes, validateSkillPackage } from "../skills-toolkit/validation";
import { openDatabase, transaction } from "./connection";

export interface SkillMetadata extends Omit<SkillPackage, "files"> {
	fileCount: number;
	managed: boolean;
	revision: number;
	sourceCommit?: string;
}
export interface CatalogPage { skills: SkillMetadata[]; total: number; page: number; pageSize: number; categories: string[] }
type Row = { id: string; slug: string; name: string; description: string; category: string; source_json: string; source_commit: string | null; managed: number; revision: number; created_at: string; updated_at: string; file_count: number };
const projection = "s.*, (SELECT count(*) FROM skill_files f WHERE f.skill_id = s.id) AS file_count";
const hash = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex");
function metadata(row: Row): SkillMetadata {
	return { id: row.id, slug: row.slug, name: row.name, description: row.description, category: row.category, source: JSON.parse(row.source_json) as SkillSource, importedAt: row.updated_at, fileCount: row.file_count, managed: row.managed === 1, revision: row.revision, ...(row.source_commit ? { sourceCommit: row.source_commit } : {}) };
}

export function listSkills(input: { q?: string; category?: string; page?: number; pageSize?: number } = {}, connection?: DatabaseSync): CatalogPage {
	const db = connection || openDatabase();
	try {
		const q = (input.q || "").slice(0, 200).trim();
		const category = (input.category || "").slice(0, 200);
		const search = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
		const clauses = "(? = '' OR s.name LIKE ? ESCAPE '\\' OR s.description LIKE ? ESCAPE '\\') AND (? = '' OR s.category = ?)";
		const args = [q, search, search, category, category];
		const total = Number((db.prepare(`SELECT count(*) AS total FROM skills s WHERE ${clauses}`).get(...args) as { total: number }).total);
		const pageSize = Math.min(50, Math.max(1, Math.floor(input.pageSize || 24)));
		const page = Math.min(Math.max(1, Math.floor(input.page || 1)), Math.max(1, Math.ceil(total / pageSize)));
		const rows = db.prepare(`SELECT ${projection} FROM skills s WHERE ${clauses} ORDER BY s.name COLLATE NOCASE, s.id LIMIT ? OFFSET ?`).all(...args, pageSize, (page - 1) * pageSize) as unknown as Row[];
		const categories = db.prepare("SELECT DISTINCT category FROM skills ORDER BY category COLLATE NOCASE").all() as { category: string }[];
		return { skills: rows.map(metadata), total, page, pageSize, categories: categories.map((entry) => entry.category) };
	} finally { if (!connection) db.close(); }
}

export function getSkill(id: string, connection?: DatabaseSync): (SkillPackage & { managed: boolean; revision: number; sourceCommit?: string }) | null {
	if (!/^(?:upstream|user):[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 80) return null;
	const db = connection || openDatabase();
	try {
		const row = db.prepare(`SELECT ${projection} FROM skills s WHERE id = ?`).get(id) as Row | undefined;
		if (!row) return null;
		const rows = db.prepare("SELECT path, encoding, content, sha256 FROM skill_files WHERE skill_id = ? ORDER BY path").all(id) as { path: string; encoding: "utf8" | "base64"; content: Uint8Array; sha256: string }[];
		const files: SkillFile[] = rows.map((file) => {
			if (hash(file.content) !== file.sha256) throw new Error("Stored skill checksum verification failed.");
			return { path: file.path, encoding: file.encoding, content: Buffer.from(file.content).toString(file.encoding === "utf8" ? "utf8" : "base64") };
		});
		return { ...metadata(row), files };
	} finally { if (!connection) db.close(); }
}

/** Reparse all untrusted metadata from SKILL.md. Never trust client-supplied display fields. */
export function checkedPackage(value: unknown, source: SkillSource): SkillPackage {
	if (!value || typeof value !== "object" || !Array.isArray((value as { files?: unknown }).files)) throw new Error("A complete skill package is required.");
	const files = (value as { files: unknown[] }).files;
	if (!files.length || files.length > 256) throw new Error("A skill must contain 1–256 files.");
	const normalized: SkillFile[] = files.map((item) => {
		if (!item || typeof item !== "object") throw new Error("Invalid skill file.");
		const file = item as Record<string, unknown>;
		if (typeof file.path !== "string" || typeof file.content !== "string" || (file.encoding !== "utf8" && file.encoding !== "base64") || file.content.length > 2_796_204) throw new Error("Invalid or oversized skill file.");
		return { path: file.path, content: file.content, encoding: file.encoding };
	});
	const skill = parseSkillFiles(normalized, source);
	if (!skill.category.trim() || skill.category.length > 200 || /[\u0000-\u001f\u007f]/.test(skill.category)) throw new Error("Category must contain 1–200 printable characters.");
	return skill;
}

export function packageHash(skill: SkillPackage): string {
	return hash(JSON.stringify([...skill.files].sort((a, b) => a.path.localeCompare(b.path)).map((file) => [file.path, file.encoding, hash(skillFileBytes(file))])));
}

function writeFiles(db: DatabaseSync, id: string, files: SkillFile[]): void {
	db.prepare("DELETE FROM skill_files WHERE skill_id = ?").run(id);
	const insert = db.prepare("INSERT INTO skill_files(skill_id,path,encoding,content,sha256) VALUES(?,?,?,?,?)");
	for (const file of files) { const bytes = skillFileBytes(file); insert.run(id, file.path, file.encoding, bytes, hash(bytes)); }
}

/** Caller transaction permits a whole sync/import batch to succeed or roll back together. */
export function putSkill(db: DatabaseSync, skill: SkillPackage, options: { managed: boolean; sourceCommit?: string; expectedRevision?: number } ): "inserted" | "updated" | "unchanged" {
	const errors = validateSkillPackage(skill).filter((issue) => issue.severity === "error");
	if (errors.length) throw new Error(errors.map((issue) => issue.message).join(" "));
	const managed = options.managed ? 1 : 0;
	const id = `${managed ? "upstream" : "user"}:${skill.slug}`;
	const previous = db.prepare("SELECT content_hash, revision FROM skills WHERE id = ?").get(id) as { content_hash: string; revision: number } | undefined;
	const digest = packageHash(skill);
	if (previous && !managed && options.expectedRevision === undefined) throw new Error(`The skill “${skill.slug}” already exists. Edit it explicitly rather than overwriting it.`);
	if (options.expectedRevision !== undefined && (!previous || previous.revision !== options.expectedRevision)) throw new Error("This skill changed or was removed. Reload before saving.");
	if (previous?.content_hash === digest && managed) return "unchanged";
	const now = new Date().toISOString();
	db.prepare(`INSERT INTO skills(id,slug,name,description,category,managed,source_json,source_commit,content_hash,created_at,updated_at)
		VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description, category=excluded.category,
		source_json=excluded.source_json, source_commit=excluded.source_commit, content_hash=excluded.content_hash, updated_at=excluded.updated_at, revision=skills.revision+1`)
		.run(id, skill.slug, skill.name, skill.description, skill.category, managed, JSON.stringify(skill.source), options.sourceCommit || null, digest, now, now);
	writeFiles(db, id, skill.files);
	return previous ? "updated" : "inserted";
}

export function importUserSkills(skills: SkillPackage[]): SkillPackage[] {
	const db = openDatabase();
	try { return transaction(db, () => { for (const skill of skills) putSkill(db, skill, { managed: false }); return skills.map((skill) => getSkill(`user:${skill.slug}`, db)!); }); }
	finally { db.close(); }
}

export function updateUserSkill(id: string, files: unknown, revision: number): SkillPackage {
	if (!id.startsWith("user:")) throw new Error("Upstream-managed skills cannot be edited.");
	const db = openDatabase();
	try {
		return transaction(db, () => {
			const previous = getSkill(id, db);
			if (!previous) throw new Error("Skill not found.");
			const skill = checkedPackage({ files }, previous.source);
			if (skill.slug !== previous.slug) throw new Error("Keep the existing skill name when editing. Import a new package to rename it.");
			putSkill(db, skill, { managed: false, expectedRevision: revision });
			return getSkill(id, db)!;
		});
	} finally { db.close(); }
}

export function deleteUserSkill(id: string, revision: number): void {
	if (!id.startsWith("user:")) throw new Error("Upstream-managed skills cannot be removed.");
	const db = openDatabase();
	try { const result = db.prepare("DELETE FROM skills WHERE id = ? AND managed = 0 AND revision = ?").run(id, revision); if (result.changes !== 1) throw new Error("This skill changed or was removed. Reload before removing it."); }
	finally { db.close(); }
}
