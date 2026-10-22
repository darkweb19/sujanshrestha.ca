import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { openDatabase, transaction } from "../db/connection";
import { HttpError } from "./http";

const cookieName = "lab_session";
const sessionLife = 8 * 60 * 60;
type Session = { tokenHash: string; csrfToken: string; expiresAt: number };

function config() {
	const password = process.env.LAB_ADMIN_PASSWORD || "";
	const secret = process.env.LAB_SESSION_SECRET || "";
	return password.length >= 16 && secret.length >= 32 ? { password, secret } : null;
}
export function adminConfigured(): boolean { return config() !== null; }
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const safeEqual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
function credentialVersion(settings: NonNullable<ReturnType<typeof config>>): string { return createHmac("sha256", settings.secret).update(settings.password).digest("hex"); }

/** Explicit exact-origin validation protects login and authenticated state changes. */
export function requireOrigin(request: Request): void {
	const actual = request.headers.get("origin");
	const configured = process.env.LAB_ORIGIN;
	if (process.env.NODE_ENV === "production" && !configured) throw new HttpError(503, "Owner access is not configured.");
	let expected: URL;
	try { expected = new URL(configured || request.url); }
	catch { throw new HttpError(503, "Owner access is not configured."); }
	if (configured && (expected.pathname !== "/" || expected.search || expected.hash || expected.username || expected.password)) throw new HttpError(503, "Owner access is not configured.");
	if (process.env.NODE_ENV === "production" && expected.protocol !== "https:") throw new HttpError(503, "Owner access requires HTTPS.");
	if (!configured && !["localhost", "127.0.0.1", "[::1]"].includes(expected.hostname)) throw new HttpError(403, "Owner access requires a configured site origin.");
	if (!actual || actual !== expected.origin) throw new HttpError(403, "This request must come from the portfolio website.");
	const fetchSite = request.headers.get("sec-fetch-site");
	if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") throw new HttpError(403, "Cross-site writes are not allowed.");
}

/** Persistent limits survive app restarts. A global login bucket bounds IP spoofing too. */
export function rateLimit(bucket: string, maximum: number, periodSeconds: number, now = Date.now()): void {
	const db = openDatabase();
	try {
		transaction(db, () => {
			db.prepare("DELETE FROM rate_limits WHERE resets_at < ?").run(now);
			const existing = db.prepare("SELECT attempts FROM rate_limits WHERE bucket = ?").get(bucket) as { attempts: number } | undefined;
			if (existing && existing.attempts >= maximum) throw new HttpError(429, "Too many attempts. Please wait before trying again.");
			db.prepare("INSERT INTO rate_limits(bucket,attempts,resets_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1").run(bucket, now + periodSeconds * 1000);
		});
	} finally { db.close(); }
}

export function sessionFor(request: Request): Session | null {
	const settings = config();
	if (!settings) return null;
	const raw = request.headers.get("cookie")?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
	if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return null;
	const db = openDatabase();
	try {
		const tokenHash = digest(raw);
		const row = db.prepare("SELECT csrf_token, expires_at, credential_version FROM admin_sessions WHERE token_hash = ?").get(tokenHash) as { csrf_token: string; expires_at: number; credential_version: string } | undefined;
		if (!row || row.expires_at <= Date.now() || !safeEqual(row.credential_version, credentialVersion(settings))) return null;
		return { tokenHash, csrfToken: row.csrf_token, expiresAt: row.expires_at };
	} finally { db.close(); }
}

export function requireAdmin(request: Request): Session {
	requireOrigin(request);
	const session = sessionFor(request);
	if (!session) throw new HttpError(401, "Sign in as the owner to manage skills.");
	if (!safeEqual(request.headers.get("x-csrf-token") || "", session.csrfToken)) throw new HttpError(403, "Your session changed. Reload and try again.");
	rateLimit(`write:${session.tokenHash}`, 60, 15 * 60);
	return session;
}

function cookie(value: string, maxAge: number): string {
	return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function login(request: Request, password: unknown): { csrfToken: string; cookie: string } {
	requireOrigin(request);
	const settings = config();
	if (!settings) throw new HttpError(503, "Owner sign-in is disabled until credentials are configured.");
	rateLimit("login:global", 60, 15 * 60);
	// Railway's edge is expected to sanitize forwarding headers; the global limit remains authoritative.
	const address = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
	rateLimit(`login:${digest(address)}`, 8, 15 * 60);
	if (typeof password !== "string" || password.length > 1024) throw new HttpError(401, "The owner password is incorrect.");
	const actual = scryptSync(password, settings.secret, 64);
	const expected = scryptSync(settings.password, settings.secret, 64);
	if (!timingSafeEqual(actual, expected)) throw new HttpError(401, "The owner password is incorrect.");
	const token = randomBytes(32).toString("hex");
	const csrfToken = randomBytes(32).toString("hex");
	const db = openDatabase();
	try {
		transaction(db, () => {
			db.prepare("DELETE FROM admin_sessions WHERE expires_at < ?").run(Date.now());
			db.prepare("INSERT INTO admin_sessions(token_hash,csrf_token,expires_at,credential_version) VALUES(?,?,?,?)").run(digest(token), csrfToken, Date.now() + sessionLife * 1000, credentialVersion(settings));
		});
	} finally { db.close(); }
	return { csrfToken, cookie: cookie(token, sessionLife) };
}

export function logout(request: Request): string {
	const session = requireAdmin(request);
	const db = openDatabase();
	try { db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").run(session.tokenHash); }
	finally { db.close(); }
	return cookie("", 0);
}
