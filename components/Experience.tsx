import { experiences } from "@/lib/portfolio";
export default function Experience() {
	return (
		<section id="experience" className="portfolio-section section-container">
			<header className="section-heading">
				<h2 className="section-kicker">Experience</h2>
				<p className="section-title">Where I&apos;ve been.</p>
			</header>
			<ol className="career-list">
				{experiences.map((exp) => (
					<li key={exp.id}>
						<details
							id={exp.id}
							className="content-disclosure career-disclosure"
						>
							<summary>
								<span className="timeline-date">
									{exp.period}
									{exp.status === "ACTIVE" && (
										<span className="current-role">Current role</span>
									)}
								</span>
								<span className="career-heading">
									<span className="timeline-role">{exp.title}</span>
									<span className="timeline-company">{exp.company}</span>
								</span>
								<span className="disclosure-mark" aria-hidden="true">
									+
								</span>
							</summary>
							<div className="career-body disclosure-body">
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
							</div>
						</details>
					</li>
				))}
			</ol>
		</section>
	);
}
