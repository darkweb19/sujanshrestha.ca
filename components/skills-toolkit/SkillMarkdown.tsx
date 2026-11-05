"use client";

import { renderSkillMarkdown } from "@/lib/skills-toolkit/markdown";
import { useMemo } from "react";

export default function SkillMarkdown({ source }: { source: string }) {
	return useMemo(() => renderSkillMarkdown(source), [source]);
}
