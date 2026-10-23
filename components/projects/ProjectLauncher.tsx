"use client";
import { useState, type ReactNode } from "react";
import ProjectBrowser from "./ProjectBrowser";
import type { PortfolioProject } from "@/lib/portfolio";
export default function ProjectLauncher({
	project,
	children,
}: {
	project: PortfolioProject;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button
				type="button"
				className="project-launch"
				aria-label={`Preview ${project.title}`}
				aria-haspopup="dialog"
				onClick={() => setOpen(true)}
			>
				{children}
			</button>
			{open && (
				<ProjectBrowser project={project} onClose={() => setOpen(false)} />
			)}
		</>
	);
}
