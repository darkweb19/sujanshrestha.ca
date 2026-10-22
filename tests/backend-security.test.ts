import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { migrate, openDatabase } from "../lib/db/connection";
import { login, logout, rateLimit, requireAdmin, requireOrigin, sessionFor } from "../lib/server/auth";
import { importPublicGitHub, parseGitHubUrl } from "../lib/server/github-import";
import { readBytes } from "../lib/server/http";
import { POST as importRoute } from "../app/api/skills/import/route";
import { GET as packageRoute } from "../app/api/skills/[id]/route";

const directory = mkdtempSync(join(tmpdir(), "portfolio-auth-test-"));
process.env.SQLITE_PATH = join(directory, "portfolio.sqlite");
process.env.LAB_ADMIN_PASSWORD = "test-only-owner-password";
process.env.LAB_SESSION_SECRET = "test-only-session-secret-at-least-32-characters";
process.env.LAB_ORIGIN = "http://localhost:3000";
const db = openDatabase({ initialize: true }); migrate(db); db.close();
after(() => rmSync(directory, { recursive: true, force: true }));
const request = (headers: Record<string, string> = {}) => new Request("http://localhost:3000/api/lab/session", { method: "POST", headers: { Origin: "http://localhost:3000", ...headers } });

test("login requires exact origin; authentication and CSRF protect mutations", () => {
	assert.throws(() => requireOrigin(request({ Origin: "https://attacker.example" })), /portfolio website/);
	assert.throws(() => login(request(), "wrong password"), /incorrect/);
	assert.throws(() => requireAdmin(request()), /Sign in/);
	const session = login(request(), process.env.LAB_ADMIN_PASSWORD);
	const cookie = session.cookie.split(";")[0];
	assert.match(session.cookie, /HttpOnly; SameSite=Strict/);
	assert.equal(sessionFor(request({ cookie }))!.csrfToken, session.csrfToken);
	assert.throws(() => requireAdmin(request({ cookie })), /session changed/);
	assert.throws(() => requireAdmin(request({ cookie, "X-CSRF-Token": session.csrfToken, Origin: "https://attacker.example" })), /portfolio website/);
	assert.ok(requireAdmin(request({ cookie, "X-CSRF-Token": session.csrfToken })));
	logout(request({ cookie, "X-CSRF-Token": session.csrfToken }));
	assert.equal(sessionFor(request({ cookie })), null);
});

test("rotating owner credentials invalidates existing sessions", () => {
	const session = login(request(), process.env.LAB_ADMIN_PASSWORD);
	const cookie = session.cookie.split(";")[0];
	process.env.LAB_ADMIN_PASSWORD = "changed-test-only-owner-password";
	assert.equal(sessionFor(request({ cookie })), null);
	process.env.LAB_ADMIN_PASSWORD = "test-only-owner-password";
});

test("rate limits persist, expire and reject excess attempts", () => {
	rateLimit("test-bucket", 2, 10, 1000); rateLimit("test-bucket", 2, 10, 1001);
	assert.throws(() => rateLimit("test-bucket", 2, 10, 1002), /Too many/);
	rateLimit("test-bucket", 2, 10, 12000);
});

test("body bounds reject oversized streaming requests without Content-Length", async () => {
	const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(100)); controller.enqueue(new Uint8Array(100)); controller.close(); } });
	const req = new Request("http://localhost:3000", { method: "POST", body, duplex: "half" } as RequestInit);
	await assert.rejects(readBytes(req, 150), /too large/);
});

test("server import rejects unauthenticated writes and persists validated owner imports", async () => {
	const body = { packages: [{ files: [{ path: "SKILL.md", encoding: "utf8", content: "---\nname: server-upload\ndescription: Cross-browser persistence fixture.\n---\nInstructions.\n" }] }] };
	const unauthorized = await importRoute(new Request("http://localhost:3000/api/skills/import", { method: "POST", headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" }, body: JSON.stringify(body) }));
	assert.equal(unauthorized.status, 401);
	const session = login(request(), process.env.LAB_ADMIN_PASSWORD);
	const cookie = session.cookie.split(";")[0];
	const saved = await importRoute(new Request("http://localhost:3000/api/skills/import", { method: "POST", headers: { Origin: "http://localhost:3000", "Content-Type": "application/json", cookie, "X-CSRF-Token": session.csrfToken }, body: JSON.stringify(body) }));
	assert.equal(saved.status, 201);
	const publicRead = await packageRoute(new Request("http://localhost:3000/api/skills/user%3Aserver-upload"), { params: Promise.resolve({ id: "user:server-upload" }) });
	assert.equal(publicRead.status, 200);
	assert.equal((await publicRead.json()).description, "Cross-browser persistence fixture.");
});

test("GitHub URLs reject credentials, SSRF hosts, ports and unsafe encodings", () => {
	for (const value of ["http://github.com/a/b", "https://github.com.attacker.example/a/b", "https://token@github.com/a/b", "https://github.com:444/a/b", "https://127.0.0.1/a/b", "https://github.com/a/b/tree/main/%2Fsecret", "https://github.com/a/b?token=x"]) assert.throws(() => parseGitHubUrl(value));
});

test("public GitHub imports pin the commit, verify source blobs and keep redirects disabled", async () => {
	const text = "---\nname: remote-skill\ndescription: Verified remote package.\n---\nSource.\n";
	const bytes = Buffer.from(text);
	const sha = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
	const commit = "a".repeat(40); const tree = "b".repeat(40);
	const urls: string[] = [];
	const mock: typeof fetch = async (input, init) => {
		const url = String(input); urls.push(url); assert.equal(init?.redirect, "error"); assert.equal(init?.credentials, "omit");
		if (url.endsWith("/repos/example/repository")) return Response.json({ private: false, default_branch: "main" });
		if (url.endsWith("/commits/main")) return Response.json({ sha: commit, commit: { tree: { sha: tree } } });
		if (url.includes("/git/trees/")) return Response.json({ tree: [{ path: "remote-skill/SKILL.md", mode: "100644", type: "blob", sha, size: bytes.length }], truncated: false });
		return new Response(bytes);
	};
	const imported = await importPublicGitHub("https://github.com/example/repository", mock);
	assert.equal(imported[0].slug, "remote-skill"); assert.match(imported[0].source.url!, new RegExp(commit));
	assert.ok(urls.every((url) => ["api.github.com", "raw.githubusercontent.com"].includes(new URL(url).hostname)));
	await assert.rejects(importPublicGitHub("https://github.com/example/repository", async (input, init) => { const response = await mock(input, init); return String(input).includes("raw.githubusercontent.com") ? new Response("corrupt".padEnd(bytes.length)) : response; }), /checksum/);
});
