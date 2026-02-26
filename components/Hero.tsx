import Image from "next/image";
import { HeroParallax, HeroTextAnimations } from "./HeroAnimations";

/**
 * Hero section — server component.
 * The LCP image and all text are SSR'd and sent in the initial HTML payload.
 * Only the parallax scroll effect and text fade-in are client-side (via HeroAnimations).
 */
export default function Hero() {
	return (
		<HeroParallax>
			<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
				{/* Left - Text Content */}
				<div className="order-2 lg:order-1">
					<HeroTextAnimations>
						{/* Greeting */}
						<p className="text-beige-highlight font-mono text-sm tracking-wider mb-6">
							&#47;&#47; HELLO WORLD
						</p>

						{/* Name */}
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
							<span className="gradient-text">
								Sujan Shrestha
							</span>
							<br />
						</h1>

						{/* Role badge */}
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-beige mb-6">
							<span className="w-2 h-2 rounded-full bg-beige-highlight animate-pulse" />
							<span className="text-beige-accent text-sm font-medium">
								Full-Stack Software Engineer
							</span>
						</div>

						{/* Tagline */}
						<p className="text-lg md:text-xl text-text-muted max-w-lg mb-10">
							I create{" "}
							<span className="text-beige-highlight font-semibold">
								beautiful products
							</span>{" "}
							that{" "}
							<span className="text-primary-start text-2xl font-bold">
								empower people
							</span>
							. Based in Toronto, CA.
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-wrap gap-4">
							{/* Primary Button */}
							<a
								href="https://sujansthadev-resume2.s3.us-east-1.amazonaws.com/Sujan+Shrestha+dev.pdf"
								target="_blank"
								rel="noopener noreferrer"
								className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-start to-primary-end text-bg-0 font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(176,137,104,0.4)] hover:scale-[1.02]"
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

							{/* Secondary Button */}
							<a
								href="#contact"
								className="group inline-flex items-center gap-2 px-6 py-3.5 glass-beige text-beige-highlight font-semibold rounded-xl transition-all duration-300 hover:bg-beige-highlight/10"
							>
								<span>Get In Touch</span>
								<svg
									className="w-4 h-4 transition-transform group-hover:translate-x-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</a>
						</div>
					</HeroTextAnimations>
				</div>

				{/* Right - Profile Image (SSR, no animation wrapper, instant LCP) */}
				<div className="order-1 lg:order-2 flex justify-center lg:justify-end">
					<div className="relative">
						{/* Decorative glow */}
						<div className="absolute -inset-4 bg-gradient-to-br from-primary-start/20 via-transparent to-beige-highlight/20 rounded-3xl blur-2xl" />

						{/* Floating decorative rings — pure CSS animation on desktop */}
						<div className="absolute -top-4 -right-4 w-20 h-20 rounded-full border border-beige-accent/20 hero-ring hero-ring-cw" />
						<div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full border border-primary-start/20 hero-ring hero-ring-ccw" />

						{/* Main image container */}
						<div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96">
							{/* Glass frame */}
							<div className="absolute inset-0 rounded-2xl glass-beige glow-beige" />

							{/* Image — SSR'd, priority, instant paint */}
							<div className="relative w-full h-full p-2">
								<Image
									src="/images/sujan.jpg"
									alt="Sujan Shrestha — Full-Stack Software Engineer based in Toronto"
									width={384}
									height={384}
									className="rounded-xl object-cover w-full h-full"
									priority
									fetchPriority="high"
									sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 384px"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</HeroParallax>
	);
}
