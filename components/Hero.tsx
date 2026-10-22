import Image from "next/image";
import Link from "next/link";
import HeroCanvas from "./home/HeroCanvas";
import Arrow from "./common/Arrow";
import ScheduleCallModal from "./ScheduleCallModal";

export default function Hero() {
	return (
		<section
			id="home"
			className="portfolio-hero section-container"
			aria-label="Introduction"
		>
			<div className="hero-rail">
				<p>Full-Stack Software Engineer</p>
				<p>Based in Toronto, CA.</p>
			</div>
			<HeroCanvas>
				<h1 className="hero-type">
					<span className="hero-first">Sujan</span>
					<span className="hero-last">Shrestha.</span>
				</h1>
				<div className="hero-cutout">
					<div className="hero-portrait-motion">
						<Image
							src="/images/sujan.jpg"
							alt="Sujan Shrestha"
							fill
							sizes="(max-width: 640px) 600px, (max-width: 1000px) 780px, 900px"
							priority
						/>
					</div>
				</div>
			</HeroCanvas>
			<div className="hero-introduction">
				<p className="hero-summary">
					I create beautiful products that empower people. Based in Toronto, CA.
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
				<span>From thoughtful interfaces to the systems behind them.</span>
				<Link href="/lab/codex">
					Explore the Skills Lab <Arrow />
				</Link>
			</div>
		</section>
	);
}
