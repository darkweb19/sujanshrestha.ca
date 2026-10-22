import { experiences } from "@/lib/portfolio";
export default function Experience() {
	return (
		<section id="experience" className="portfolio-section section-container">
			<header className="section-heading">
				<h2 className="section-kicker">Experience</h2>
				<p className="section-title">
					The work behind
					<br />
					the work.
				</p>
			</header>
			<ol>
				{experiences.map((exp) => (
					<li key={exp.id} className="timeline-row">
						<div className="timeline-date">
							{exp.period}
							{exp.status === "ACTIVE" && (
								<span className="block text-text-primary mt-2">
									Current role
								</span>
							)}
						</div>
						<article>
							<h3 className="timeline-role">{exp.title}</h3>
							<p className="timeline-company">{exp.company}</p>
							<p className="timeline-meta">
								{exp.type} · {exp.location}
							</p>
							<ul className="timeline-highlights">
								{exp.highlights.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<div className="tech-list">
								{exp.technologies.map((tech) => (
									<span key={tech}>{tech}</span>
								))}
							</div>
						</article>
					</li>
				))}
			</ol>
		</section>
	);
}
