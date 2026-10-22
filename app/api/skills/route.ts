import { listSkills } from "@/lib/db/catalog";
import { failure, json } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
	try { const query = new URL(request.url).searchParams; return json(listSkills({ q: query.get("q") || "", category: query.get("category") || "", page: Number(query.get("page")) || 1, pageSize: Number(query.get("pageSize")) || 24 })); }
	catch (error) { return failure(error); }
}
