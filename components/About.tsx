const skills = [
	"Next.js",
	"TypeScript",
	"React",
	"Node.js",
	"AWS",
	"Docker",
	"PostgreSQL",
	"MongoDB",
	"GraphQL",
	"Linux",
	"GitHub",
];
export default function About() {
	return (
		<section
			id="about"
			className="portfolio-section section-container about-section"
		>
			<header className="section-heading">
				<h2 className="section-kicker">A little about me</h2>
				<div>
					<p className="about-intro">
						Hey — I&apos;m Sujan. I build web apps that feel smooth, modern, and
						a little bit &quot;wow.&quot;
					</p>
					<details className="content-disclosure about-disclosure">
						<summary>
							More about me{" "}
							<span className="disclosure-mark" aria-hidden="true">
								+
							</span>
						</summary>
						<div className="disclosure-body">
							<p>
								I love creating clean UI, subtle animations, and experiences
								that users enjoy using every day — across the full stack.
							</p>
							<p>
								If you&apos;re building something ambitious and want a developer
								who cares about both engineering + aesthetics, let&apos;s
								connect.
							</p>
							<div className="tech-list" aria-label="Technology stack">
								{skills.map((skill) => (
									<span key={skill}>{skill}</span>
								))}
							</div>
						</div>
					</details>
				</div>
			</header>
		</section>
	);
}
