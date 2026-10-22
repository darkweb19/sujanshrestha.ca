import { projects } from "@/lib/portfolio";
import Arrow from "@/components/common/Arrow";
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
							className={`project-row ${project.featured ? "project-feature" : ""}`}
							aria-label={`${project.title} — open project`}
						>
							<h3>
								{project.title}
								{project.featured && (
									<span className="project-feature-label">
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
							<span className="project-arrow">
								<Arrow size={20} />
							</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
