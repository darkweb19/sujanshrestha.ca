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
		<section id="about" className="portfolio-section section-container">
			<header className="section-heading">
				<h2 className="section-kicker">About</h2>
				<p className="section-title">
					Engineering, with
					<br />
					an eye for detail.
				</p>
			</header>
			<div className="about-grid">
				<aside className="about-aside">
					If you&apos;re building something ambitious and want a developer who
					cares about both engineering + aesthetics, let&apos;s connect.
				</aside>
				<div className="about-copy">
					<p className="about-intro">
						Hey — I&apos;m Sujan. I build web apps that feel smooth, modern, and
						a little bit &quot;wow.&quot;
					</p>
					<p className="section-copy">
						I love creating clean UI, subtle animations, and experiences that
						users enjoy using every day — across the full stack.
					</p>
					<div className="tech-list" aria-label="Technology stack">
						{skills.map((skill) => (
							<span key={skill}>{skill}</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
