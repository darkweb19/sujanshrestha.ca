import { education } from "@/lib/portfolio";
export default function Academics() {
	return (
		<section id="academics" className="portfolio-section education-section">
			<div className="section-container">
				<header className="section-heading">
					<h2 className="section-kicker">Academics</h2>
					<div>
						<p className="section-title">
							A continuing
							<br />
							education.
						</p>
						<p className="education-intro">
							From the foothills of the Himalayas to the shores of Lake Ontario
							— my educational journey across continents.
						</p>
					</div>
				</header>
				<ol>
					{education.map((item) => (
						<li key={item.level} className="education-row">
							<div className="timeline-date">
								{item.year}
								<span className="block mt-2">
									{item.country === "canada" ? "Canada" : "Nepal"}
								</span>
							</div>
							<article>
								<h3>{item.level}</h3>
								<p>{item.institution}</p>
								<p>{item.description}</p>
							</article>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
