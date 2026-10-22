import { deleteUserSkill, getSkill, updateUserSkill } from "@/lib/db/catalog";
import { requireAdmin } from "@/lib/server/auth";
import { failure, HttpError, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
	try { const skill = getSkill((await context.params).id); if (!skill) throw new HttpError(404, "Skill not found."); return json(skill); }
	catch (error) { return failure(error); }
}
export async function PUT(request: Request, context: Context) {
	try {
		requireAdmin(request);
		const data = await readJson(request, 35 * 1024 * 1024);
		if (!Number.isSafeInteger(data.revision) || Number(data.revision) < 1) throw new HttpError(400, "The original revision is required.");
		return json(updateUserSkill((await context.params).id, data.files, Number(data.revision)));
	} catch (error) { return failure(error); }
}
export async function DELETE(request: Request, context: Context) {
	try {
		requireAdmin(request);
		const data = await readJson(request, 4096);
		if (!Number.isSafeInteger(data.revision) || Number(data.revision) < 1) throw new HttpError(400, "The original revision is required.");
		deleteUserSkill((await context.params).id, Number(data.revision));
		return json({ removed: true });
	} catch (error) { return failure(error); }
}
