import { getSkill } from "@/lib/db/catalog";
import { rawSkillId } from "@/lib/skills-toolkit/skill-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };
const headers = {
	"Cache-Control": "no-store",
	"Access-Control-Allow-Origin": "*",
	"X-Content-Type-Options": "nosniff",
	"Content-Security-Policy": "default-src 'none'; sandbox",
};

function unavailable(status: number, message: string): Response {
	return new Response(message, { status, headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" } });
}

/** Public agent-readable source, without the site shell or a rendered Markdown wrapper. */
export async function GET(_request: Request, context: Context): Promise<Response> {
	const id = rawSkillId((await context.params).slug);
	if (!id) return unavailable(404, "Skill not found.\n");
	try {
		const skill = getSkill(id);
		const entrypoint = skill?.files.find((file) => file.path === "SKILL.md" && file.encoding === "utf8");
		if (!entrypoint) return unavailable(404, "Skill not found.\n");
		return new Response(entrypoint.content, { headers: { ...headers, "Content-Type": "text/markdown; charset=utf-8" } });
	} catch {
		return unavailable(503, "The skill library is unavailable. Please try again later.\n");
	}
}
