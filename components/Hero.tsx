import Image from "next/image";
import Link from "next/link";
import ScheduleCallModal from "./ScheduleCallModal";

export default function Hero() {
	return (
		<section
			id="home"
			className="portfolio-hero section-container"
			aria-label="Introduction"
		>
			<div className="hero-grid">
				<div>
					<p className="hero-role">Full-Stack Software Engineer</p>
					<h1 className="hero-name">
						Sujan
						<br />
						Shrestha.
					</h1>
					<p className="hero-summary">
						I create beautiful products that empower people. Based in Toronto,
						CA.
					</p>
					<div className="hero-actions">
						<Link href="/#projects" className="action action-primary">
							Explore my work <span aria-hidden="true">↓</span>
						</Link>
						<a
							href="/Sujan.pdf"
							download="Sujan_Shrestha_Resume.pdf"
							className="action"
						>
							Download CV
						</a>
						<ScheduleCallModal />
					</div>
				</div>
				<figure>
					<div className="hero-portrait">
						<Image
							src="/images/sujan.jpg"
							alt="Sujan Shrestha"
							fill
							sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 1000px) 240px, 290px"
							priority
						/>
					</div>
					<figcaption className="portrait-caption">
						<span>Toronto, Canada</span>
						<span>Engineering + aesthetics</span>
					</figcaption>
				</figure>
			</div>
			<div className="hero-bottom">
				<span>From thoughtful interfaces to the systems behind them.</span>
				<a href="/lab/codex">Explore the Skills Lab</a>
			</div>
		</section>
	);
}
