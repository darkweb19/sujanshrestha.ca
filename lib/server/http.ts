export class HttpError extends Error {
	constructor(public status: number, message: string) { super(message); }
}

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
	return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
}

export function failure(error: unknown): Response {
	if (error instanceof HttpError) return json({ error: error.message }, error.status);
	// Validation and stale-write errors are safe, authored messages; never expose SQL or environment details.
	if (error instanceof Error && !/SQLITE|sqlite|database|ENOENT|EACCES|constraint|syntax error/i.test(error.message)) return json({ error: error.message }, /changed|already exists/.test(error.message) ? 409 : 400);
	return json({ error: "The skill library is unavailable. Please try again later." }, 503);
}

export async function readBytes(request: Request, limit: number): Promise<Uint8Array> {
	const declared = Number(request.headers.get("content-length"));
	if (declared > limit) throw new HttpError(413, "Upload is too large. Use a smaller package.");
	if (!request.body) throw new HttpError(400, "A request body is required.");
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		for (;;) {
			const part = await reader.read();
			if (part.done) break;
			size += part.value.length;
			if (size > limit) { await reader.cancel(); throw new HttpError(413, "Upload is too large. Use a smaller package."); }
			chunks.push(part.value);
		}
	} finally { reader.releaseLock(); }
	return Buffer.concat(chunks, size);
}

export async function readJson(request: Request, limit = 64 * 1024): Promise<Record<string, unknown>> {
	if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Send an application/json request.");
	try {
		const data: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(await readBytes(request, limit)));
		if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
		return data as Record<string, unknown>;
	} catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Send a valid JSON object."); }
}
