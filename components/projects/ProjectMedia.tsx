import Image from "next/image";
import type { PortfolioProject } from "@/lib/portfolio";

/** Authored diagrams are labeled; screenshots are captures of the actual public site. */
export default function ProjectMedia({
	project,
	large = false,
	imageAlt,
}: {
	project: PortfolioProject;
	large?: boolean;
	imageAlt?: string;
}) {
	if (project.image)
		return (
			<span className="project-screenshot">
				<Image
					src={project.image}
					alt={imageAlt || `${project.title} public homepage screenshot`}
					fill
					sizes={
						large
							? "(max-width: 640px) 90vw, 750px"
							: "(max-width: 640px) 90vw, 600px"
					}
				/>
			</span>
		);
	return (
		<span
			className={`project-illustration illustration-${project.illustration}`}
		>
			<span className="illustration-label">Workflow illustration</span>
			{project.illustration === "video" && (
				<span className="video-illustration" aria-hidden="true">
					<span className="film-title">A story in motion.</span>
					<span className="film-strip">
						{["Idea", "Scene", "Story"].map((label, i) => (
							<span className="film-frame" key={label}>
								<span className="film-play">▷</span>
								<span>{label}</span>
								<span
									className="film-lines"
									style={{ width: `${48 + i * 18}%` }}
								/>
							</span>
						))}
					</span>
					<span className="film-caption">Generate · Review · Keep</span>
				</span>
			)}
			{project.illustration === "rust" && (
				<span className="rust-illustration" aria-hidden="true">
					<span className="rust-word">
						Rust.<span>Press play.</span>
					</span>
					<span className="media-path">
						<span>URL</span>
						<span className="path-line" />
						<span className="media-play">▶</span>
						<span className="path-line" />
						<span>MP4</span>
					</span>
					<span className="film-caption">Apify → Tokio → FFmpeg</span>
				</span>
			)}
			{project.illustration === "outpost" && (
				<span className="outpost-illustration" aria-hidden="true">
					<span className="workspace-title">
						A workspace.
						<br />
						On your terms.
					</span>
					<span className="workspace-map">
						<span>Browser</span>
						<span className="workspace-connector" />
						<span className="workspace-center">Outpost</span>
						<span className="workspace-connector" />
						<span>Docker</span>
					</span>
					<span className="film-caption">Self-hosted agent environments</span>
				</span>
			)}
			{project.illustration === "draftforge" && (
				<span className="draft-illustration" aria-hidden="true">
					<span className="draft-sheet draft-sheet-back">
						<span>Decisions</span>
						<span className="document-lines" />
					</span>
					<span className="draft-sheet">
						<span>
							From idea
							<br />
							to architecture.
						</span>
						<span className="document-lines" />
						<span className="draft-signature">DraftForge</span>
					</span>
				</span>
			)}
		</span>
	);
}
