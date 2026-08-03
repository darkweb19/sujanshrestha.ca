"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

/**
 * Thin client wrapper for the hero background and parallax content.
 * Next.js still includes the priority image in the initial server-rendered HTML.
 */
export function HeroParallax({ children }: { children: ReactNode }) {
	const containerRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
	const opacity = useTransform(
		scrollYProgress,
		[0, 0.6, 0.85],
		[1, 0.65, 0]
	);

	return (
		<section
			ref={containerRef}
			id="home"
			className="relative min-h-screen flex items-center overflow-hidden"
		>
			{/* Full-bleed portrait, softly blended into the page. */}
			<div className="absolute inset-0 bg-bg-0" aria-hidden="true">
				<div className="hero-background-image-wrap absolute inset-0">
					<Image
						src="/images/sujan.jpg"
						alt=""
						fill
						className="hero-background-image object-cover"
						priority
						fetchPriority="high"
						sizes="100vw"
					/>
				</div>
				<div className="hero-background-overlay absolute inset-0" />
			</div>

			{/* Parallax content */}
			<m.div
				style={{ y, opacity }}
				className="relative z-10 section-container py-20"
			>
				{children}
			</m.div>

			{/* Scroll indicator */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-scroll-indicator">
				<div className="w-6 h-10 rounded-full border-2 border-coffee/30 flex justify-center pt-2">
					<div className="w-1 h-2 rounded-full bg-coffee hero-scroll-dot" />
				</div>
			</div>
		</section>
	);
}

/**
 * Text content fade-in animations — only wraps the text side.
 * The image side is rendered without any animation wrapper for instant LCP.
 */
export function HeroTextAnimations({ children }: { children: ReactNode }) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay: 0.1 }}
		>
			{children}
		</m.div>
	);
}
