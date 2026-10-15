import { ARCHIVE_LIMITS, type SkillPackage } from "./types";
import { bytesToSkillFile, parseSkillFiles, validateArchivePath } from "./validation";

// Imports stay in the browser. No token, cookies, executable code, or server proxy is used.
const LIMITS = { requests: 48, files: 180, skills: 20, bytes: 12 * 1024 * 1024, json: 2 * 1024 * 1024 };
interface TreeEntry { path: string; mode: string; type: string; sha: string; size?: number }
interface TreeResponse { tree: TreeEntry[]; truncated?: boolean }

function parseUrl(value: string) {
	let url: URL;
	try { url = new URL(value); } catch { throw new Error("Enter a public https://github.com/owner/repository URL."); }
	if (url.protocol !== "https:" || url.hostname !== "github.com" || url.port || url.username || url.password || url.search || url.hash) {
		throw new Error("Use a public HTTPS github.com repository, folder, or SKILL.md URL without credentials, query parameters, or fragments.");
	}
	let parts: string[];
	try { parts = url.pathname.replace(/\/$/, "").slice(1).split("/").map(decodeURIComponent); }
	catch { throw new Error("The GitHub URL has invalid encoded characters."); }
	if (parts.some((part) => !part || part === "." || part === ".." || /[\\/\u0000-\u001f\u007f]/.test(part))) throw new Error("The GitHub URL contains an unsafe path.");
	const [owner, repoName, kind, ...tail] = parts;
	const repo = repoName?.replace(/\.git$/, "");
	if (!owner || !repo || !/^[A-Za-z0-9_-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo) || (kind && kind !== "tree" && kind !== "blob")) throw new Error("Use a GitHub repository, /tree/ folder, or /blob/…/SKILL.md URL.");
	if (kind && (!tail.length || (kind === "blob" && tail.at(-1) !== "SKILL.md"))) throw new Error("A file URL must point to SKILL.md; folder URLs must include a branch.");
	return { owner, repo, kind, tail };
}

async function boundedBody(response: Response, limit: number): Promise<Uint8Array> {
	const length = response.headers.get("content-length");
	if (length && Number(length) > limit) { await response.body?.cancel(); throw new Error("GitHub response exceeds the import size limit. Import a smaller skill folder."); }
	if (!response.body) throw new Error("GitHub returned an empty response stream.");
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const next = await reader.read();
			if (next.done) break;
			size += next.value.length;
			if (size > limit) { await reader.cancel(); throw new Error("GitHub response exceeds the import size limit. Import a smaller skill folder."); }
			chunks.push(next.value);
		}
	} finally { reader.releaseLock(); }
	const result = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
	return result;
}

/** Import complete skill folders from public GitHub, pinned to a resolved commit. */
export async function importGitHubSkills(value: string, callerSignal?: AbortSignal): Promise<SkillPackage[]> {
	const { owner, repo, kind, tail } = parseUrl(value.trim());
	const signal = AbortSignal.any([AbortSignal.timeout(90_000), ...(callerSignal ? [callerSignal] : [])]);
	const api = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
	let requests = 0;
	let totalBytes = 0;
	async function request(url: string, limit: number, optionalCommitRef = false): Promise<Uint8Array | null> {
		if (signal.aborted) {
			if (callerSignal?.aborted) callerSignal.throwIfAborted();
			throw new Error("GitHub import timed out. Try an individual skill folder or upload a ZIP.");
		}
		if (++requests > LIMITS.requests) throw new Error("This import needs too many GitHub requests. Use the URL of one skill folder or upload its ZIP.");
		const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(20_000)]);
		let response: Response;
		try { response = await fetch(url, { signal: requestSignal, credentials: "omit", redirect: "error", referrerPolicy: "no-referrer", ...(url.startsWith(api) ? { headers: { Accept: "application/vnd.github+json" } } : {}) }); }
		catch (error) {
			if (callerSignal?.aborted) callerSignal.throwIfAborted();
			if (requestSignal.aborted) throw new Error("GitHub import timed out. Try an individual skill folder or upload a ZIP.");
			if (error instanceof DOMException && error.name === "AbortError") throw error;
			throw new Error("Could not reach public GitHub. Check your connection and browser network policy, or upload a skill ZIP.");
		}
		if (!response.ok) {
			// Missing commit refs can be 404 or GitHub's specific 422 response.
			// Other validation failures must not be hidden by ref disambiguation.
			if (response.status === 422 && optionalCommitRef) {
				const diagnostic = await boundedBody(response, 16 * 1024);
				let missingRef = false;
				try {
					const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(diagnostic));
					missingRef = !!body && typeof body === "object" && "message" in body && typeof body.message === "string" && body.message.startsWith("No commit found for SHA:");
				} catch { /* An unrecognized 422 remains a visible API error. */ }
				if (missingRef) return null;
			}
			await response.body?.cancel();
			if (response.status === 404 && optionalCommitRef) return null;
			if (response.status === 429 || (response.status === 403 && (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")))) {
				const reset = Number(response.headers.get("x-ratelimit-reset"));
				throw new Error(`GitHub's public API rate limit was reached.${reset ? ` Try again after ${new Date(reset * 1000).toLocaleTimeString()}.` : " Try again later."} You can upload a ZIP instead; no GitHub token is required.`);
			}
			if (response.status === 404 || response.status === 401) throw new Error("GitHub repository, branch, or folder was not found. Only public repositories are supported.");
			throw new Error(`GitHub returned HTTP ${response.status}. Try again later or upload a skill ZIP.`);
		}
		try { return await boundedBody(response, limit); }
		catch (error) {
			if (callerSignal?.aborted) callerSignal.throwIfAborted();
			if (requestSignal.aborted) throw new Error("GitHub import timed out. Try an individual skill folder or upload a ZIP.");
			throw error;
		}
	}
	async function json<T>(path: string, optionalCommitRef = false): Promise<T | null> {
		const bytes = await request(`${api}${path}`, LIMITS.json, optionalCommitRef);
		if (!bytes) return null;
		try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as T; }
		catch { throw new Error("GitHub returned an invalid API response."); }
	}
	const repository = await json<{ private: boolean; default_branch: string }>("");
	if (!repository || repository.private !== false || typeof repository.default_branch !== "string") throw new Error("Only public GitHub repositories can be imported.");
	let commit: { sha: string; commit: { tree: { sha: string } } } | null = null;
	let folder: string[] = [];
	let ref = repository.default_branch;
	if (kind) {
		// A branch can itself contain slashes. Resolve the longest valid ref first.
		const maxRefSegments = kind === "blob" ? tail.length - 1 : tail.length;
		if (maxRefSegments > 12) throw new Error("This URL is too deeply nested. Use a shorter branch URL or upload a skill ZIP.");
		for (let count = maxRefSegments; count > 0; count--) {
			ref = tail.slice(0, count).join("/");
			commit = await json(`/commits/${encodeURIComponent(ref)}`, true);
			if (commit) { folder = tail.slice(count); break; }
		}
		if (!commit) throw new Error("The GitHub branch or commit could not be resolved. Check the URL or upload a skill ZIP.");
		if (kind === "blob") folder.pop();
	} else commit = await json(`/commits/${encodeURIComponent(ref)}`);
	if (!commit || !/^[a-f0-9]{40}$/i.test(commit.sha) || !/^[a-f0-9]{40}$/i.test(commit.commit?.tree?.sha)) throw new Error("GitHub returned an invalid commit.");
	let treeSha = commit.commit.tree.sha;
	for (const part of folder) {
		const tree = await json<TreeResponse>(`/git/trees/${treeSha}`);
		if (!tree || !Array.isArray(tree.tree) || tree.truncated) throw new Error("GitHub folder listing is incomplete. Import a smaller folder or upload its ZIP.");
		const child = tree.tree.find((entry) => entry.path === part && entry.type === "tree");
		if (!child || !/^[a-f0-9]{40}$/i.test(child.sha)) throw new Error(`GitHub skill folder was not found: ${folder.join("/")}`);
		treeSha = child.sha;
	}
	const listing = await json<TreeResponse>(`/git/trees/${treeSha}?recursive=1`);
	if (!listing || !Array.isArray(listing.tree) || listing.truncated) throw new Error("GitHub's file listing is incomplete or too large. Import an individual skill folder.");
	const entries = listing.tree;
	const roots = entries.filter((entry) => entry.type === "blob" && /(?:^|\/)SKILL\.md$/.test(entry.path)).map((entry) => entry.path.slice(0, -"SKILL.md".length));
	if (!roots.length) throw new Error("No SKILL.md files were found in this GitHub folder.");
	if (roots.length > LIMITS.skills) throw new Error(`This folder contains ${roots.length} skills. Import an individual skill folder (for example, /tree/${ref}/skill-name) or a ZIP with at most ${LIMITS.skills} skills.`);
	if (roots.some((root, index) => roots.some((other, otherIndex) => index !== otherIndex && root.startsWith(other)))) throw new Error("This folder contains nested skill packages. Import each skill folder separately.");
	const files = entries.filter((entry) => entry.type !== "tree" && roots.some((root) => entry.path.startsWith(root)));
	if (files.length > LIMITS.files || requests + files.length > LIMITS.requests) throw new Error("This folder contains too many supporting files for a public GitHub import. Import one smaller skill folder or upload its ZIP.");
	let expectedBytes = 0;
	for (const entry of files) {
		if (typeof entry.path !== "string" || validateArchivePath(entry.path)) throw new Error("The GitHub skill contains an unsafe file path.");
		if (entry.type !== "blob" || (entry.mode !== "100644" && entry.mode !== "100755")) throw new Error(`Symbolic links and submodules cannot be imported: ${entry.path}`);
		if (!Number.isSafeInteger(entry.size) || entry.size! < 0 || entry.size! > ARCHIVE_LIMITS.maxFileBytes) throw new Error(`GitHub file exceeds the 2 MB limit: ${entry.path}`);
		expectedBytes += entry.size!;
	}
	if (expectedBytes > LIMITS.bytes) throw new Error("This GitHub import exceeds the 12 MB limit. Import a smaller skill folder.");
	const fetched = new Map<string, Uint8Array>();
	// Sequential downloads keep cancellation and aggregate size limits predictable.
	for (const entry of files) {
		const path = [...folder, ...entry.path.split("/")].map(encodeURIComponent).join("/");
		const bytes = await request(`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${commit.sha}/${path}`, Math.min(ARCHIVE_LIMITS.maxFileBytes, LIMITS.bytes - totalBytes));
		if (!bytes || bytes.length !== entry.size) throw new Error(`GitHub file changed unexpectedly: ${entry.path}. Please retry.`);
		totalBytes += bytes.length;
		fetched.set(entry.path, bytes);
	}
	return roots.map((root) => {
		const sourcePath = [...folder, ...root.split("/").filter(Boolean)].map(encodeURIComponent).join("/");
		const source = { kind: "github" as const, label: `${owner}/${repo}${folder.length || root ? ` · ${[...folder, root.replace(/\/$/, "")].filter(Boolean).join("/")}` : ""}`, url: `https://github.com/${owner}/${repo}/tree/${commit.sha}${sourcePath ? `/${sourcePath}` : ""}` };
		try { return parseSkillFiles(files.filter((entry) => entry.path.startsWith(root)).map((entry) => bytesToSkillFile(entry.path.slice(root.length), fetched.get(entry.path)!)), source); }
		catch (error) { throw new Error(`${root || folder.join("/") || repo}: ${error instanceof Error ? error.message : "Invalid skill package."}`); }
	});
}
