import { adminConfigured, login, logout, sessionFor } from "@/lib/server/auth";
import { failure, json, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
	try { const session = sessionFor(request); return json({ configured: adminConfigured(), authenticated: !!session, ...(session ? { csrfToken: session.csrfToken } : {}) }); }
	catch (error) { return failure(error); }
}
export async function POST(request: Request) {
	try { const data = await readJson(request, 4096); const session = login(request, data.password); return json({ authenticated: true, configured: true, csrfToken: session.csrfToken }, 200, { "Set-Cookie": session.cookie }); }
	catch (error) { return failure(error); }
}
export async function DELETE(request: Request) {
	try { return json({ authenticated: false, configured: adminConfigured() }, 200, { "Set-Cookie": logout(request) }); }
	catch (error) { return failure(error); }
}
