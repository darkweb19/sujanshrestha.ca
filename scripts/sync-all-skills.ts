import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { checkedPackage, putSkill } from "../lib/db/catalog";
import { openDatabase, transaction } from "../lib/db/connection";
import { bytesToSkillFile, validateArchivePath } from "../lib/skills-toolkit/validation";
import type { SkillPackage } from "../lib/skills-toolkit/types";

// Update this pinned revision deliberately, review the report, then commit the change.
export const SKILLS_SOURCE_COMMIT = "02e3bc090208bebb8cbf0ddc1985c51235c67b8f";
const repository = "https://github.com/darkweb19/skills.git";
const source = resolve(process.env.SKILLS_SOURCE_DIR || ".local/skills-source");
const reportPath = resolve(process.env.SKILLS_SYNC_REPORT || ".local/skills-sync-report.json");
const git = (...args: string[]) => execFileSync("git", ["--no-replace-objects", "-C", source, ...args], { maxBuffer: 64 * 1024 * 1024, timeout: 120_000, stdio: ["ignore", "pipe", "pipe"] });

if (!existsSync(source)) {
	mkdirSync(dirname(source), { recursive: true });
	execFileSync("git", ["-c", "core.hooksPath=/dev/null", "clone", "--no-checkout", repository, source], { timeout: 120_000, stdio: ["ignore", "inherit", "inherit"] });
}
const remote = git("remote", "get-url", "origin").toString("utf8").trim();
if (remote.replace(/\.git$/, "") !== repository.replace(/\.git$/, "")) throw new Error("The source cache must use the exact public darkweb19/skills HTTPS remote.");
try { git("cat-file", "-e", `${SKILLS_SOURCE_COMMIT}^{commit}`); }
catch { git("-c", "core.hooksPath=/dev/null", "fetch", "origin", SKILLS_SOURCE_COMMIT); }
if (git("rev-parse", `${SKILLS_SOURCE_COMMIT}^{commit}`).toString("utf8").trim() !== SKILLS_SOURCE_COMMIT) throw new Error("Pinned source commit mismatch.");
git("fsck", "--no-dangling", SKILLS_SOURCE_COMMIT);
type Entry = { path: string; mode: string; sha: string; type: string };
const entries: Entry[] = git("ls-tree", "-rz", SKILLS_SOURCE_COMMIT).toString("utf8").split("\0").filter(Boolean).map((line) => {
	const match = /^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
	if (!match) throw new Error("Unexpected Git tree entry.");
	return { mode: match[1], type: match[2], sha: match[3], path: match[4] };
});
const roots = entries.filter((entry) => entry.path === "SKILL.md" || entry.path.endsWith("/SKILL.md")).map((entry) => entry.path.slice(0, -8));
if (!roots.length) throw new Error("Pinned source contains no skills; refusing an empty synchronization.");
const licenses = entries.filter((entry) => !entry.path.includes("/") && /^(?:license|copying|notice)(?:\.|$)/i.test(entry.path));
const reports: { path: string; slug?: string; status: string; reason?: string; fileCount?: number; sha256?: string }[] = [];
const packages: SkillPackage[] = [];
const seen = new Set<string>();
for (const root of roots) {
	try {
		// Each package owns its subtree excluding independently declared nested packages.
		const children = entries.filter((entry) => entry.path.startsWith(root) && !roots.some((nested) => nested !== root && nested.startsWith(root) && entry.path.startsWith(nested)));
		if (children.length > 256) throw new Error("Package exceeds the validated 256-file limit.");
		const files = children.map((entry) => {
			const path = entry.path.slice(root.length);
			if (validateArchivePath(path) || entry.type !== "blob" || !["100644", "100755"].includes(entry.mode)) throw new Error(`Unsafe/symlink source entry: ${path}`);
			const size = Number(git("cat-file", "-s", entry.sha).toString("utf8"));
			if (size > 2 * 1024 * 1024) throw new Error(`Source file exceeds the 2 MB limit: ${path}`);
			const bytes = git("cat-file", "blob", entry.sha);
			if (createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") !== entry.sha) throw new Error(`Git source checksum mismatch: ${path}`);
			return bytesToSkillFile(path, bytes);
		});
		// Preserve repository-level license text without replacing any original package file.
		for (const license of licenses) {
			const path = `source-license/${license.path}`;
			if (!files.some((file) => file.path === path)) files.push(bytesToSkillFile(path, git("cat-file", "blob", license.sha)));
		}
		const sourcePath = root.replace(/\/$/, "");
		const skill = checkedPackage({ files }, { kind: "builtin", label: `darkweb19/skills · ${sourcePath || "root"}`, url: `https://github.com/darkweb19/skills/tree/${SKILLS_SOURCE_COMMIT}${sourcePath ? `/${sourcePath}` : ""}` });
		if (seen.has(skill.slug)) throw new Error(`Duplicate upstream skill name: ${skill.slug}`);
		seen.add(skill.slug);
		packages.push(skill);
		reports.push({ path: root || ".", slug: skill.slug, status: "validated", fileCount: files.length, sha256: createHash("sha256").update(JSON.stringify(files)).digest("hex") });
	} catch (error) { reports.push({ path: root || ".", status: "rejected", reason: error instanceof Error ? error.message : "Invalid package" }); }
}
if (!packages.length) throw new Error("No valid skills were found; no catalog changes made.");
const db = openDatabase();
const startedAt = new Date().toISOString();
let imported = 0; let unchanged = 0;
try {
	transaction(db, () => {
		for (const skill of packages) { if (putSkill(db, skill, { managed: true, sourceCommit: SKILLS_SOURCE_COMMIT }) === "unchanged") unchanged++; else imported++; }
		db.prepare("INSERT INTO source_sync_runs(repository,source_commit,started_at,completed_at,imported,unchanged,rejected,report_json) VALUES(?,?,?,?,?,?,?,?)")
			.run(repository, SKILLS_SOURCE_COMMIT, startedAt, new Date().toISOString(), imported, unchanged, reports.filter((entry) => entry.status === "rejected").length, JSON.stringify(reports));
	});
} finally { db.close(); }
const report = { repository, commit: SKILLS_SOURCE_COMMIT, discovered: roots.length, valid: packages.length, imported, unchanged, rejected: reports.filter((entry) => entry.status === "rejected").length, packages: reports };
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ ...report, packages: undefined, reportPath }, null, 2));
