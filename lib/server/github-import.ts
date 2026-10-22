import { createHash } from "node:crypto";
import { setGlobalProxyFromEnv } from "node:http";
import { bytesToSkillFile, validateArchivePath } from "../skills-toolkit/validation";
import type { SkillPackage } from "../skills-toolkit/types";
import { checkedPackage } from "../db/catalog";
import { HttpError } from "./http";

let proxyInitialized = false;
type TreeEntry = { path: string; type: string; mode: string; sha: string; size?: number };

export function parseGitHubUrl(value: string): { owner: string; repo: string; kind?: string; tail: string[] } {
	let url: URL;
	try { url = new URL(value); } catch { throw new HttpError(400, "Enter a public HTTPS GitHub repository or skill folder URL."); }
	if (value.length > 2048 || url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password || url.port || url.search || url.hash) throw new HttpError(400, "Only public HTTPS github.com URLs without credentials or query strings are allowed.");
	let parts: string[];
	try { parts = url.pathname.replace(/\/$/, "").slice(1).split("/").map(decodeURIComponent); } catch { throw new HttpError(400, "The GitHub path is invalid."); }
	if (parts.some((part) => !part || part === "." || part === ".." || /[\\/\u0000-\u001f\u007f]/.test(part))) throw new HttpError(400, "The GitHub path is unsafe.");
	const [owner, repoName, kind, ...tail] = parts;
	const repo = repoName?.replace(/\.git$/, "");
	if (!/^[a-z0-9_-]+$/i.test(owner || "") || !/^[a-z0-9_.-]+$/i.test(repo || "") || (kind && kind !== "tree" && kind !== "blob") || (kind && !tail.length) || (kind === "blob" && tail.at(-1) !== "SKILL.md")) throw new HttpError(400, "Use a GitHub repository, tree folder, or SKILL.md URL.");
	return { owner, repo, kind, tail };
}

/** Only fixed GitHub API/raw origins are contacted; untrusted URLs never reach fetch. */
export async function importPublicGitHub(value: string, fetcher: typeof fetch = fetch): Promise<SkillPackage[]> {
	const { owner, repo, kind, tail } = parseGitHubUrl(value);
	if (!proxyInitialized && fetcher === fetch) { setGlobalProxyFromEnv(); proxyInitialized = true; }
	const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
	let requests = 0;
	let downloaded = 0;
	const overall = AbortSignal.timeout(90_000);
	async function request(url: string, limit: number, optional = false): Promise<Uint8Array | null> {
		if (++requests > 280) throw new HttpError(400, "This import needs too many requests. Use one skill folder or upload a ZIP.");
		const parsed = new URL(url);
		if (!["api.github.com", "raw.githubusercontent.com"].includes(parsed.hostname) || parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) throw new HttpError(400, "Unsafe GitHub destination.");
		const response = await fetcher(url, { method: "GET", redirect: "error", credentials: "omit", headers: { Accept: "application/vnd.github+json", "User-Agent": "Sujan-Portfolio-Skills-Lab" }, signal: AbortSignal.any([overall, AbortSignal.timeout(20_000)]) });
		if (!response.ok) {
			await response.body?.cancel();
			if (optional && (response.status === 404 || response.status === 422)) return null;
			if (response.status === 429 || response.status === 403) throw new HttpError(429, "GitHub could not serve this request. Try later or upload a ZIP instead.");
			throw new HttpError(400, "Public GitHub repository or file was not found.");
		}
		if (Number(response.headers.get("content-length")) > limit) { await response.body?.cancel(); throw new HttpError(413, "GitHub file exceeds the size limit."); }
		if (!response.body) throw new HttpError(400, "GitHub returned an empty response.");
		const reader = response.body.getReader();
		const chunks: Uint8Array[] = [];
		let length = 0;
		try {
			for (;;) {
				const part = await reader.read(); if (part.done) break;
				length += part.value.length;
				if (length > limit) { await reader.cancel(); throw new HttpError(413, "GitHub response exceeds the size limit."); }
				chunks.push(part.value);
			}
		} finally { reader.releaseLock(); }
		return Buffer.concat(chunks, length);
	}
	async function api<T>(path: string, optional = false): Promise<T | null> { const bytes = await request(`${base}${path}`, 4 * 1024 * 1024, optional); return bytes ? JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as T : null; }
	const repository = await api<{ private: boolean; default_branch: string }>("");
	if (!repository || repository.private !== false || typeof repository.default_branch !== "string") throw new HttpError(400, "Only public GitHub repositories are supported.");
	let commit: { sha: string; commit: { tree: { sha: string } } } | null = null;
	let folder: string[] = [];
	if (kind) {
		const count = kind === "blob" ? tail.length - 1 : tail.length;
		if (count > 12) throw new HttpError(400, "Use a shorter branch/folder URL.");
		for (let n = count; n > 0; n--) { commit = await api(`/commits/${encodeURIComponent(tail.slice(0, n).join("/"))}`, true); if (commit) { folder = tail.slice(n); if (kind === "blob") folder.pop(); break; } }
	} else commit = await api(`/commits/${encodeURIComponent(repository.default_branch)}`);
	if (!commit || !/^[a-f0-9]{40}$/i.test(commit.sha) || !/^[a-f0-9]{40}$/i.test(commit.commit?.tree?.sha)) throw new HttpError(400, "GitHub commit could not be resolved.");
	let treeSha = commit.commit.tree.sha;
	for (const segment of folder) {
		const tree = await api<{ tree: TreeEntry[]; truncated?: boolean }>(`/git/trees/${treeSha}`);
		if (!tree || tree.truncated || !Array.isArray(tree.tree)) throw new HttpError(400, "GitHub folder listing is incomplete.");
		const child = tree.tree.find((entry) => entry.path === segment && entry.type === "tree");
		if (!child || !/^[a-f0-9]{40}$/i.test(child.sha)) throw new HttpError(400, "GitHub folder was not found.");
		treeSha = child.sha;
	}
	const listing = await api<{ tree: TreeEntry[]; truncated?: boolean }>(`/git/trees/${treeSha}?recursive=1`);
	if (!listing || listing.truncated || !Array.isArray(listing.tree)) throw new HttpError(400, "GitHub file listing is incomplete. Use a smaller folder.");
	const roots = listing.tree.filter((entry) => entry.type === "blob" && /(?:^|\/)SKILL\.md$/.test(entry.path)).map((entry) => entry.path.slice(0, -8));
	if (!roots.length || roots.length > 20 || roots.some((root) => roots.some((other) => root !== other && root.startsWith(other)))) throw new HttpError(400, "Import 1–20 separate skill folders without nested SKILL.md packages.");
	const files = listing.tree.filter((entry) => entry.type !== "tree" && roots.some((root) => entry.path.startsWith(root)));
	if (files.length > 256) throw new HttpError(413, "Import contains more than 256 files. Use a smaller skill folder.");
	const result = new Map<string, Uint8Array>();
	for (const file of files) {
		if (typeof file.path !== "string" || validateArchivePath(file.path) || !["100644", "100755"].includes(file.mode) || file.type !== "blob" || !/^[a-f0-9]{40}$/i.test(file.sha) || !Number.isSafeInteger(file.size) || file.size! < 0 || file.size! > 2 * 1024 * 1024) throw new HttpError(400, "GitHub package has an unsafe path, symlink, or oversized file.");
		const rawPath = [...folder, ...file.path.split("/")].map(encodeURIComponent).join("/");
		const bytes = await request(`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${commit.sha}/${rawPath}`, Math.min(2 * 1024 * 1024, 25 * 1024 * 1024 - downloaded));
		if (!bytes || bytes.length !== file.size) throw new HttpError(400, "GitHub file size did not match its pinned source.");
		const blobHash = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
		if (blobHash !== file.sha) throw new HttpError(400, "GitHub file checksum did not match its pinned source.");
		downloaded += bytes.length;
		result.set(file.path, bytes);
	}
	return roots.map((root) => checkedPackage({ files: files.filter((file) => file.path.startsWith(root)).map((file) => bytesToSkillFile(file.path.slice(root.length), result.get(file.path)!)) }, { kind: "github", label: `${owner}/${repo} · ${[...folder, root.replace(/\/$/, "")].filter(Boolean).join("/")}`, url: `https://github.com/${owner}/${repo}/tree/${commit.sha}/${[...folder, ...root.split("/").filter(Boolean)].map(encodeURIComponent).join("/")}` }));
}
