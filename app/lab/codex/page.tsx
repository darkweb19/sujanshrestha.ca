import type { Metadata } from "next";
import SkillsToolkit from "@/components/skills-toolkit/SkillsToolkit";

export const metadata: Metadata = {
	title: "AI Skills Toolkit",
	description: "Browse, import, and package reusable AI coding skills for Codex, Claude Code, Cursor, and GitHub Copilot.",
	alternates: { canonical: "/lab/codex" },
};

export default function SkillsToolkitPage() { return <SkillsToolkit />; }
