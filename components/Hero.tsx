import Image from "next/image";
import Link from "next/link";
import Arrow from "./common/Arrow";
import ScheduleCallModal from "./ScheduleCallModal";

export default function Hero() {
	return (
		<section id="home" className="portfolio-hero" aria-label="Introduction">
			<div className="hero-background" aria-hidden="true">
				<Image
					src="/images/sujan.jpg"
					alt=""
					fill
					sizes="100vw"
					quality={50}
					priority
					fetchPriority="high"
				/>
			</div>
			<div className="hero-gradient-blur" aria-hidden="true" />
			<div className="hero-content section-container">
				<div className="hero-rail">
					<p>Full-Stack Software Engineer</p>
					<p>Based in Toronto, CA.</p>
				</div>
				<div className="hero-introduction">
					<h1 className="hero-name">
						Sujan <span>Shrestha.</span>
					</h1>
					<p className="hero-summary">
						I create beautiful products that empower people.
					</p>
					<div className="hero-actions">
						<Link href="/#projects" className="action action-primary">
							Explore my work <Arrow />
						</Link>
						<a
							href="/Sujan.pdf"
							download="Sujan_Shrestha_Resume.pdf"
							className="action hero-cv"
						>
							Download CV <Arrow down />
						</a>
						<ScheduleCallModal />
					</div>
				</div>
				<div className="hero-bottom">
					<span>Interfaces, systems, and everything between.</span>
					<Link href="/lab/codex">
						Explore the Skills Lab <Arrow />
					</Link>
				</div>
			</div>
		</section>
	);
}
