import { HeroParallax, HeroTextAnimations } from "./HeroAnimations";
import ScheduleCallModal from "./ScheduleCallModal";

/**
 * Hero section — server component.
 * The LCP image and all text are SSR'd and sent in the initial HTML payload.
 * Only the parallax scroll effect and text fade-in are client-side (via HeroAnimations).
 */
export default function Hero() {
	return (
		<HeroParallax>
			<div className="relative min-h-[calc(100svh-10rem)] flex items-end pb-14 sm:items-center sm:pb-0">
				<div className="relative z-10 w-full max-w-xl">
					<HeroTextAnimations>
						<p className="text-coffee font-mono text-sm tracking-wider mb-6">
							&#47;&#47; HELLO WORLD
						</p>

						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
							<span className="gradient-text">Sujan Shrestha</span>
							<br />
						</h1>

						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-beige mb-6">
							<span className="w-2 h-2 rounded-full bg-coffee" />
							<span className="text-espresso text-sm font-medium">
								Full-Stack Software Engineer
							</span>
						</div>

						<p className="text-lg md:text-xl text-text-muted max-w-lg mb-10">
							I create{" "}
							<span className="text-coffee font-semibold">
								beautiful products
							</span>{" "}
							that{" "}
							<span className="text-coffee font-semibold">
								empower people
							</span>
							. Based in Toronto, CA.
						</p>

						<div className="flex flex-wrap gap-4">
							<a
								href="/Sujan.pdf"
								download="Sujan_Shrestha_Resume.pdf"
								className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-start to-primary-end text-bg-1 font-semibold rounded-xl shadow-card transition-all duration-300 hover:opacity-90"
							>
								<span>Download CV</span>
								<svg
									className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</a>

							<ScheduleCallModal />
						</div>
					</HeroTextAnimations>
				</div>
			</div>
		</HeroParallax>
	);
}
