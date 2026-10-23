"use client";
import { useEffect, useState } from "react";
import type { PortfolioProject } from "@/lib/portfolio";
import Modal from "../common/Modal";
import Arrow from "../common/Arrow";
import ProjectMedia from "./ProjectMedia";
export default function ProjectBrowser({
	project,
	onClose,
}: {
	project: PortfolioProject;
	onClose: () => void;
}) {
	const [mode, setMode] = useState<"preview" | "overview">(
		project.embed ? "preview" : "overview",
	);
	const [attempt, setAttempt] = useState(0);
	const [status, setStatus] = useState<"opening" | "idle" | "slow">("opening");
	useEffect(() => {
		if (mode !== "preview") return;
		const timer = window.setTimeout(
			() => setStatus((current) => (current === "opening" ? "slow" : current)),
			8000,
		);
		return () => window.clearTimeout(timer);
	}, [mode, attempt]);
	const retry = () => {
		setStatus("opening");
		setAttempt((value) => value + 1);
	};
	const titleId = `project-title-${project.id}`;
	return (
		<Modal
			labelledBy={titleId}
			className={`project-browser tone-${project.tone}`}
			onClose={onClose}
		>
			<header className="browser-heading">
				<span className="window-dots" aria-hidden="true">
					<i />
					<i />
					<i />
				</span>
				<h2 id={titleId}>{project.title}</h2>
				<button
					data-modal-close
					type="button"
					className="browser-close"
					onClick={onClose}
					aria-label="Close project preview"
				>
					Close <span aria-hidden="true">×</span>
				</button>
			</header>
			<div className="browser-toolbar">
				<div className="browser-modes" role="group" aria-label="Project view">
					{project.embed && (
						<button
							type="button"
							aria-pressed={mode === "preview"}
							onClick={() => {
								if (mode !== "preview") {
									setStatus("opening");
									setMode("preview");
								}
							}}
						>
							Live preview
						</button>
					)}
					<button
						type="button"
						aria-pressed={mode === "overview"}
						onClick={() => setMode("overview")}
					>
						{project.embed ? "About project" : "Project overview"}
					</button>
				</div>
				<p className="browser-address">
					<span aria-hidden="true">↗</span>{" "}
					{project.url.replace(/^https?:\/\//, "")}
				</p>
				<a
					href={project.live || project.url}
					target="_blank"
					rel="noopener noreferrer"
					className="browser-external"
				>
					{project.live ? "Open website" : "View on GitHub"}
					<Arrow size={15} />
				</a>
			</div>
			<div className="browser-content">
				{mode === "preview" && project.embed ? (
					<iframe
						key={attempt}
						onLoad={() => setStatus("idle")}
						onError={() => setStatus("slow")}
						title={`${project.title} live website`}
						src={project.embed}
						className="project-live-frame"
						sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
						referrerPolicy="no-referrer"
					/>
				) : (
					<div className="project-overview">
						<div className={`overview-media tone-${project.tone}`}>
							<ProjectMedia
								project={
									project.id === "framevault"
										? { ...project, image: "/images/projects/framevault.png" }
										: project
								}
								imageAlt={
									project.id === "framevault"
										? "FrameVault public sign-in screen"
										: undefined
								}
								large
							/>
							<p>
								{project.image
									? "Actual public homepage"
									: project.id === "framevault"
										? "Actual public sign-in screen"
										: "Authored workflow illustration"}
							</p>
						</div>
						<div className="overview-copy">
							<p className="project-category">{project.category}</p>
							<h3>{project.summary}</h3>
							<p>{project.description}</p>
							<div className="tech-list">
								{project.tech.map((tech) => (
									<span key={tech}>{tech}</span>
								))}
							</div>
							<div className="overview-links">
								{project.live && (
									<a
										href={project.live}
										target="_blank"
										rel="noopener noreferrer"
									>
										Open website <Arrow size={14} />
									</a>
								)}
								{project.source && (
									<a
										href={project.source}
										target="_blank"
										rel="noopener noreferrer"
									>
										View source <Arrow size={14} />
									</a>
								)}
							</div>
							{!project.embed && (
								<p className="preview-boundary">
									{project.live
										? "The hosted site opens in a new tab."
										: "GitHub doesn’t support embedded pages. The repository opens in a new tab."}
								</p>
							)}
						</div>
					</div>
				)}
			</div>
			<footer className="browser-footer">
				<span role="status">
					{mode === "preview"
						? status === "opening"
							? "Opening the live page…"
							: status === "slow"
								? "Taking longer than expected. Retry or open the website above."
								: "Preview blank or unavailable? Open the website above."
						: "A closer look, without losing your place."}
				</span>
				{mode === "preview" && (
					<div className="browser-recovery">
						<button type="button" onClick={retry}>
							Retry preview
						</button>
						<button type="button" onClick={() => setMode("overview")}>
							Read project details
						</button>
					</div>
				)}
			</footer>
		</Modal>
	);
}
