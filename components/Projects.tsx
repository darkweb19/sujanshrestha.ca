import { projects } from "@/lib/portfolio";
export default function Projects() {
	return (
		<section id="projects" className="portfolio-section projects-section">
			<div className="section-container">
				<header className="section-heading">
					<h2 className="section-kicker">Projects</h2>
					<p className="section-title">Built to be used.</p>
				</header>
				<div>
					{projects.map((project) => (
						<a
							key={project.title}
							href={project.url}
							target="_blank"
							rel="noopener noreferrer"
							className="project-row"
							aria-label={`${project.title} — open project`}
						>
							<h3>
								{project.title}
								{project.featured && (
									<span className="block text-sm font-normal tracking-normal text-text-dim mt-3">
										Featured project
									</span>
								)}
							</h3>
							<div className="project-details">
								<p>{project.description}</p>
								<div className="tech-list">
									{project.tech.map((tech) => (
										<span key={tech}>{tech}</span>
									))}
								</div>
							</div>
							<span className="project-arrow" aria-hidden="true">
								↗
							</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
