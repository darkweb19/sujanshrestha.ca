"use client";

import { renderSkillMarkdown } from "@/lib/skills-toolkit/markdown";

export default function SkillMarkdown({ source }: { source: string }) {
	return renderSkillMarkdown(source);
}
