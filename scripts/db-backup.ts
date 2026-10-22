import { backup } from "node:sqlite";
import { chmodSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { openDatabase } from "../lib/db/connection";

async function main() {
	const destination = process.argv[2];
	if (!destination) throw new Error("Usage: tsx scripts/db-backup.ts /safe/backup-YYYY-MM-DD.sqlite");
	const path = resolve(destination);
	if (existsSync(path)) throw new Error("Refusing to overwrite an existing backup.");
	mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
	const db = openDatabase();
	try { await backup(db, path); chmodSync(path, 0o600); console.log("Consistent SQLite backup completed."); }
	finally { db.close(); }
}
void main().catch((error) => { console.error(error instanceof Error ? error.message : "Backup failed."); process.exitCode = 1; });
