import { openDatabase } from "@/lib/db/connection";
import { json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
	try {
		const db = openDatabase();
		try { const result = db.prepare("SELECT count(*) AS count FROM source_sync_runs WHERE completed_at IS NOT NULL").get() as { count: number }; if (!result.count) return json({ status: "initializing" }, 503); }
		finally { db.close(); }
		return json({ status: "ok" });
	} catch { return json({ status: "unavailable" }, 503); }
}
