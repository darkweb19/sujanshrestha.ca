import { spawn, spawnSync } from "node:child_process";
import { chmodSync } from "node:fs";
import { databasePath, migrate, openDatabase } from "../lib/db/connection";

// Explicit runtime initialization, never a side effect of rendering or building.
const db = openDatabase({ initialize: true });
let needsSeed = false;
try {
	migrate(db);
	chmodSync(databasePath(), 0o600);
	needsSeed = Number((db.prepare("SELECT count(*) AS count FROM source_sync_runs WHERE completed_at IS NOT NULL").get() as { count: number }).count) === 0;
} finally { db.close(); }
if (needsSeed) {
	const seeded = spawnSync("pnpm", ["exec", "tsx", "scripts/sync-all-skills.ts"], { stdio: "inherit", env: process.env });
	if (seeded.status !== 0) throw new Error("Initial full skills synchronization failed; refusing to start an empty production catalog.");
}
const port = process.env.PORT || "3000";
if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error("PORT must be between 1 and 65535.");
const server = spawn("pnpm", ["exec", "next", "start", "--hostname", "0.0.0.0", "--port", port], { stdio: "inherit", env: process.env });
for (const signal of ["SIGTERM", "SIGINT"] as const) process.on(signal, () => server.kill(signal));
server.on("exit", (code) => { process.exitCode = code ?? 1; });
server.on("error", () => { process.exitCode = 1; });
