import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** A file outside build output is required; production must explicitly select its volume. */
export function databasePath(): string {
	const configured = process.env.SQLITE_PATH;
	if (!configured && process.env.NODE_ENV === "production") throw new Error("SQLITE_PATH must point to a persistent volume. Run db:init before starting the service.");
	return resolve(configured || ".local/portfolio.sqlite");
}

export function openDatabase(options: { initialize?: boolean; path?: string } = {}): DatabaseSync {
	const path = options.path || databasePath();
	if (!options.initialize && !existsSync(path)) throw new Error("The skills database is not initialized. Run db:init and skills:sync before starting the service.");
	if (options.initialize) mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
	const db = new DatabaseSync(path);
	db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
	if (options.initialize) db.exec("PRAGMA journal_mode = WAL;");
	return db;
}

export function transaction<T>(db: DatabaseSync, operation: () => T): T {
	db.exec("BEGIN IMMEDIATE");
	try { const result = operation(); db.exec("COMMIT"); return result; }
	catch (error) { db.exec("ROLLBACK"); throw error; }
}

export function migrate(db: DatabaseSync): void {
	transaction(db, () => {
		db.exec(`
			CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT;
			CREATE TABLE IF NOT EXISTS skills (
				id TEXT PRIMARY KEY, slug TEXT NOT NULL, name TEXT NOT NULL,
				description TEXT NOT NULL CHECK(length(description) BETWEEN 1 AND 1024),
				category TEXT NOT NULL CHECK(length(category) BETWEEN 1 AND 200),
				managed INTEGER NOT NULL CHECK(managed IN (0,1)), source_json TEXT NOT NULL CHECK(json_valid(source_json)),
				source_commit TEXT, content_hash TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1 CHECK(revision > 0),
				created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(managed, slug),
				CHECK(length(slug) BETWEEN 1 AND 64), CHECK(id = CASE managed WHEN 1 THEN 'upstream:' ELSE 'user:' END || slug)
			) STRICT;
			CREATE INDEX IF NOT EXISTS skills_category_name ON skills(category, name, id);
			CREATE INDEX IF NOT EXISTS skills_name ON skills(name COLLATE NOCASE, id);
			CREATE TABLE IF NOT EXISTS skill_files (
				skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE, path TEXT NOT NULL,
				encoding TEXT NOT NULL CHECK(encoding IN ('utf8','base64')), content BLOB NOT NULL,
				sha256 TEXT NOT NULL CHECK(length(sha256) = 64), PRIMARY KEY(skill_id, path)
			) STRICT;
			CREATE TABLE IF NOT EXISTS source_sync_runs (
				id INTEGER PRIMARY KEY, repository TEXT NOT NULL, source_commit TEXT NOT NULL,
				started_at TEXT NOT NULL, completed_at TEXT, imported INTEGER NOT NULL DEFAULT 0,
				unchanged INTEGER NOT NULL DEFAULT 0, rejected INTEGER NOT NULL DEFAULT 0,
				report_json TEXT NOT NULL CHECK(json_valid(report_json))
			) STRICT;
			CREATE TABLE IF NOT EXISTS admin_sessions (
				token_hash TEXT PRIMARY KEY, csrf_token TEXT NOT NULL, expires_at INTEGER NOT NULL,
				credential_version TEXT NOT NULL
			) STRICT;
			CREATE INDEX IF NOT EXISTS sessions_expiry ON admin_sessions(expires_at);
			CREATE TABLE IF NOT EXISTS rate_limits (
				bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL CHECK(attempts > 0), resets_at INTEGER NOT NULL
			) STRICT;
			INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES(1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
		`);
	});
}
