import assert from "node:assert/strict";
import test from "node:test";
import { importGitHubSkills } from "../lib/skills-toolkit/github";
import { loadImportedSkills } from "../lib/skills-toolkit/storage";

const commitSha = "1".repeat(40);
const rootSha = "2".repeat(40);
const folderSha = "3".repeat(40);
const entry = "---\nname: example\ndescription: A portable skill\n---\nUse references/context.md.\n";
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });

async function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>, run: () => Promise<void>) {
	const original = globalThis.fetch;
	globalThis.fetch = (async (url, init) => handler(String(url), init)) as typeof fetch;
	try { await run(); } finally { globalThis.fetch = original; }
}

test("GitHub imports reject credentials, non-GitHub hosts, and unsupported URLs before fetching", async () => {
	await mockFetch(() => { throw new Error("must not fetch"); }, async () => {
		for (const url of ["https://user:secret@github.com/a/b", "https://github.com.evil.test/a/b", "http://github.com/a/b", "https://github.com/a/b/issues", "https://github.com/a/b?token=secret", "https://github.com/a/b/blob/main/README.md"]) {
			await assert.rejects(importGitHubSkills(url));
		}
	});
});

test("slash-containing branches resolve and complete text/binary supporting files survive", async () => {
	const seen: string[] = [];
	await mockFetch((url, init) => {
		seen.push(url);
		assert.equal(init?.credentials, "omit");
		assert.equal(init?.redirect, "error");
		if (url.endsWith("/repos/person/skills")) return json({ private: false, default_branch: "main" });
		if (url.endsWith("/commits/feature%2Fskills%2Fexample")) return json({ message: "No commit found for SHA: feature/skills/example", status: "422" }, 422);
		if (url.endsWith("/commits/feature%2Fskills")) return json({ sha: commitSha, commit: { tree: { sha: rootSha } } });
		if (url.endsWith(`/git/trees/${rootSha}`)) return json({ tree: [{ path: "example", type: "tree", sha: folderSha }] });
		if (url.endsWith(`/git/trees/${folderSha}?recursive=1`)) return json({ tree: [
			{ path: "SKILL.md", type: "blob", mode: "100644", size: new TextEncoder().encode(entry).length },
			{ path: "references/context.md", type: "blob", mode: "100644", size: 7 },
			{ path: "image.bin", type: "blob", mode: "100644", size: 3 },
		] });
		if (url.endsWith("/SKILL.md")) return new Response(entry);
		if (url.endsWith("/references/context.md")) return new Response("Context");
		if (url.endsWith("/image.bin")) return new Response(new Uint8Array([0, 255, 10]));
		throw new Error(`Unexpected fetch: ${url}`);
	}, async () => {
		const skills = await importGitHubSkills("https://github.com/person/skills/tree/feature/skills/example");
		assert.equal(skills.length, 1);
		assert.deepEqual(skills[0].files.find((file) => file.path === "image.bin"), { path: "image.bin", content: "AP8K", encoding: "base64" });
		assert.equal(skills[0].source.url, `https://github.com/person/skills/tree/${commitSha}/example`);
		assert.equal(skills[0].files.length, 3);
		assert(seen.filter((url) => url.startsWith("https://raw.githubusercontent.com/")).every((url) => url.includes(commitSha)));
	});
});

test("missing candidate refs still fall back on 404, while unrelated 422 errors remain visible", async () => {
	const commits: string[] = [];
	await mockFetch((url) => {
		if (url.endsWith("/repos/person/skills")) return json({ private: false, default_branch: "main" });
		commits.push(url);
		return json({ message: "Not Found" }, 404);
	}, async () => { await assert.rejects(importGitHubSkills("https://github.com/person/skills/tree/main/example"), /could not be resolved/); });
	assert.equal(commits.length, 2);
	assert(commits[1].endsWith("/commits/main"));
	for (const repositoryError of [true, false]) {
		let requests = 0;
		await mockFetch((url) => {
			requests++;
			if (!repositoryError && url.endsWith("/repos/person/skills")) return json({ private: false, default_branch: "main" });
			return json({ message: repositoryError ? "No commit found for SHA: main/example" : "Validation Failed" }, 422);
		}, async () => { await assert.rejects(importGitHubSkills("https://github.com/person/skills/tree/main/example"), /HTTP 422/); });
		assert.equal(requests, repositoryError ? 1 : 2);
	}
});

test("GitHub rate limits produce useful guidance without asking for credentials", async () => {
	await mockFetch(() => new Response("", { status: 403, headers: { "x-ratelimit-remaining": "0" } }), async () => {
		await assert.rejects(importGitHubSkills("https://github.com/person/skills"), /rate limit[\s\S]*ZIP[\s\S]*no GitHub token/i);
	});
});

test("oversized files, symlinks and truncated GitHub trees fail before raw downloads", async () => {
	for (const mode of ["oversized", "symlink", "truncated"]) {
		await mockFetch((url) => {
			assert(!url.startsWith("https://raw.githubusercontent.com/"));
			if (url.endsWith("/repos/person/skills")) return json({ private: false, default_branch: "main" });
			if (url.includes("/commits/")) return json({ sha: commitSha, commit: { tree: { sha: rootSha } } });
			return json({ truncated: mode === "truncated", tree: [{ path: "SKILL.md", type: "blob", mode: mode === "symlink" ? "120000" : "100644", size: mode === "oversized" ? 2 * 1024 * 1024 + 1 : 10 }] });
		}, async () => { await assert.rejects(importGitHubSkills("https://github.com/person/skills"), /2 MB|Symbolic links|incomplete/); });
	}
});

test("streaming file reads enforce limits even without a Content-Length header", async () => {
	let canceled = false;
	await mockFetch((url) => {
		if (url.endsWith("/repos/person/skills")) return json({ private: false, default_branch: "main" });
		if (url.includes("/commits/")) return json({ sha: commitSha, commit: { tree: { sha: rootSha } } });
		if (url.includes("/git/trees/")) return json({ tree: [{ path: "SKILL.md", type: "blob", mode: "100644", size: 1 }] });
		return new Response(new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(2 * 1024 * 1024 + 1)); }, cancel() { canceled = true; } }));
	}, async () => { await assert.rejects(importGitHubSkills("https://github.com/person/skills"), /size limit/); });
	assert(canceled);
});

test("oversized Content-Length is rejected and the unread response stream is canceled", async () => {
	let canceled = false;
	await mockFetch(() => new Response(new ReadableStream({ cancel() { canceled = true; } }), { headers: { "content-length": String(2 * 1024 * 1024 + 1) } }), async () => {
		await assert.rejects(importGitHubSkills("https://github.com/person/skills"), /size limit/);
	});
	assert(canceled);
});

test("canceling an in-flight fetch stops the import without further requests", async () => {
	const controller = new AbortController();
	let calls = 0;
	await mockFetch((_url, init) => {
		calls++;
		return new Promise<Response>((_resolve, reject) => {
			init?.signal?.addEventListener("abort", () => reject(init.signal!.reason), { once: true });
			queueMicrotask(() => controller.abort());
		});
	}, async () => {
		await assert.rejects(importGitHubSkills("https://github.com/person/skills", controller.signal), { name: "AbortError" });
	});
	assert.equal(calls, 1);
});

test("canceled imports stop before network access and unsupported storage fails visibly", async () => {
	const controller = new AbortController();
	controller.abort();
	await mockFetch(() => { throw new Error("must not fetch"); }, async () => {
		await assert.rejects(importGitHubSkills("https://github.com/person/skills", controller.signal), { name: "AbortError" });
	});
	await assert.rejects(loadImportedSkills(), /Enable site storage/);
});
