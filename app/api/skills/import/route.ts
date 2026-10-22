import { checkedPackage, importUserSkills } from "@/lib/db/catalog";
import { importSkillZip } from "@/lib/skills-toolkit/archive";
import { bytesToSkillFile, skillFileBytes } from "@/lib/skills-toolkit/validation";
import type { SkillPackage } from "@/lib/skills-toolkit/types";
import { requireAdmin } from "@/lib/server/auth";
import { importPublicGitHub } from "@/lib/server/github-import";
import { failure, HttpError, json, readBytes, readJson } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
	try {
		requireAdmin(request);
		let skills: SkillPackage[] = [];
		if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
			const body = await readBytes(request, 10 * 1024 * 1024 + 64 * 1024);
			const bounded = new Request(request.url, { method: "POST", headers: { "content-type": request.headers.get("content-type")! }, body: Buffer.from(body) });
			const files = (await bounded.formData()).getAll("files");
			if (!files.length || files.length > 20 || files.some((file) => !(file instanceof File))) throw new HttpError(400, "Choose 1–20 Markdown or ZIP files.");
			for (const file of files as File[]) {
				const source = { kind: "local" as const, label: file.name.slice(0, 200) };
				const bytes = new Uint8Array(await file.arrayBuffer());
				if (/\.zip$/i.test(file.name)) skills.push(...await importSkillZip(bytes, source));
				else if (/\.md$/i.test(file.name)) skills.push(checkedPackage({ files: [bytesToSkillFile("SKILL.md", bytes)] }, source));
				else throw new HttpError(400, "Upload only Markdown (.md) or ZIP (.zip) files.");
			}
		} else {
			const data = await readJson(request, 35 * 1024 * 1024);
			if (typeof data.githubUrl === "string") skills = await importPublicGitHub(data.githubUrl);
			else {
				if (!Array.isArray(data.packages) || !data.packages.length || data.packages.length > 20) throw new HttpError(400, "Import 1–20 complete skill packages.");
				skills = data.packages.map((value) => checkedPackage(value, { kind: "local", label: "Owner import" }));
			}
		}
		if (!skills.length || skills.length > 20) throw new HttpError(400, "Import at most 20 skills at once.");
		let bytes = 0; let files = 0;
		for (const skill of skills) { files += skill.files.length; for (const file of skill.files) bytes += skillFileBytes(file).length; }
		if (files > 256 || bytes > 25 * 1024 * 1024) throw new HttpError(413, "Import exceeds 256 files or 25 MB expanded. Use a smaller batch.");
		return json({ skills: importUserSkills(skills) }, 201);
	} catch (error) { return failure(error); }
}
