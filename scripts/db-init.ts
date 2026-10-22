import { chmodSync } from "node:fs";
import { databasePath, migrate, openDatabase } from "../lib/db/connection";

const db = openDatabase({ initialize: true });
try { migrate(db); chmodSync(databasePath(), 0o600); console.log("Skills database migrations applied."); }
finally { db.close(); }
