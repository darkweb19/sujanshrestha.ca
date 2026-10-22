import type { Metadata } from "next";
import SkillsToolkit from "@/components/skills-toolkit/SkillsToolkit";
import { listSkills } from "@/lib/db/catalog";
import type { CatalogPage } from "@/lib/skills-toolkit/client-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
	title: "AI Skills Toolkit",
	description:
		"Explore complete AI coding skill packages. Select, preview, and export instructions for Codex, Claude Code, Cursor, and GitHub Copilot.",
	alternates: { canonical: "/lab/codex" },
	twitter: {
		card: "summary_large_image",
		title: "Skills Toolkit | Sujan Shrestha",
		description:
			"Complete AI skill packages for Codex, Claude Code, Cursor, and GitHub Copilot.",
	},
	openGraph: {
		title: "Skills Toolkit | Sujan Shrestha",
		description:
			"Good instructions travel. A practical AI coding skill library with complete packages for your next repository.",
		url: "/lab/codex",
	},
};

export default async function SkillsToolkitPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const q = typeof params.q === "string" ? params.q : "";
	const category =
		typeof params.category === "string" ? params.category : "all";
	const page =
		typeof params.page === "string" ? Math.max(1, Number(params.page) || 1) : 1;
	let initial: CatalogPage = {
		skills: [],
		total: 0,
		page: 1,
		pageSize: 12,
		categories: [],
	};
	let unavailable = false;
	try {
		initial = listSkills({
			q,
			category: category === "all" ? undefined : category,
			page,
			pageSize: 12,
		});
	} catch {
		unavailable = true;
	}
	return (
		<SkillsToolkit
			initial={initial}
			initialQuery={q}
			initialCategory={category}
			unavailable={unavailable}
		/>
	);
}
