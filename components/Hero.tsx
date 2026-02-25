"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function Hero() {
	const containerRef = useRef<HTMLElement>(null);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Check if device is mobile/low-power
		const checkMobile = () => {
			setIsMobile(window.matchMedia("(max-width: 768px)").matches);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

	return (
		<section
			ref={containerRef}
			id="home"
			className="relative min-h-screen flex items-center overflow-hidden"
		>
			{/* Animated Background */}
			<div className="absolute inset-0 bg-bg-0">
				{/* Grid pattern */}
				<div
					className="absolute inset-0 opacity-[0.02]"
					style={{
						backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
						backgroundSize: "60px 60px",
					}}
				/>

				{/* Floating orbs - static on mobile for performance */}
				{isMobile ? (
					<>
						<div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary-start/10 blur-[80px]" />
						<div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-primary-end/10 blur-[60px]" />
					</>
				) : (
					<>
						<motion.div
							className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-start/10 blur-[120px]"
							animate={{
								x: [0, 50, 0],
								y: [0, 30, 0],
							}}
							transition={{
								duration: 8,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
						<motion.div
							className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary-end/10 blur-[100px]"
							animate={{
								x: [0, -40, 0],
								y: [0, -20, 0],
							}}
							transition={{
								duration: 10,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
					</>
				)}
			</div>

			{/* Content */}
			<motion.div
				style={{ y, opacity }}
				className="relative z-10 section-container py-20"
			>
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					{/* Left - Text Content */}
					<div className="order-2 lg:order-1">
						{/* Greeting */}
						<motion.p
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-beige-highlight font-mono text-sm tracking-wider mb-6"
						>
							&#47;&#47; HELLO WORLD
						</motion.p>

						{/* Name */}
						<motion.h1
							initial={{
								opacity: 0,
								y: 30,
								filter: "blur(10px)",
							}}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
						>
							<span className="gradient-text">
								Sujan Shrestha
							</span>
							<br />
						</motion.h1>

						{/* Role badge */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-beige mb-6"
						>
							<span className="w-2 h-2 rounded-full bg-beige-highlight animate-pulse" />
							<span className="text-beige-accent text-sm font-medium">
								Full-Stack Software Engineer
							</span>
						</motion.div>

						{/* Tagline */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.7 }}
							className="text-lg md:text-xl text-text-muted max-w-lg mb-10"
						>
							I create{" "}
							<span className="text-beige-highlight font-semibold">
								beautiful products
							</span>{" "}
							that{" "}
							<span className="text-primary-start text-2xl font-bold">
								empower people
							</span>
							. Based in Toronto, CA.
						</motion.p>

						{/* CTA Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.9 }}
							className="flex flex-wrap gap-4"
						>
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
						</motion.div>
					</div>

					{/* Right - Profile Image */}
					<div className="order-1 lg:order-2 flex justify-center lg:justify-end">
						<div className="relative">
							{/* Decorative elements */}
							<div className="absolute -inset-4 bg-gradient-to-br from-primary-start/20 via-transparent to-beige-highlight/20 rounded-3xl blur-2xl" />

							{/* Floating decorative dots - static on mobile */}
							{isMobile ? (
								<>
									<div className="absolute -top-4 -right-4 w-20 h-20 rounded-full border border-beige-accent/20" />
									<div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full border border-primary-start/20" />
								</>
							) : (
								<>
									<motion.div
										className="absolute -top-4 -right-4 w-20 h-20 rounded-full border border-beige-accent/20"
										animate={{ rotate: 360 }}
										transition={{
											duration: 20,
											repeat: Infinity,
											ease: "linear",
										}}
									/>
									<motion.div
										className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full border border-primary-start/20"
										animate={{ rotate: -360 }}
										transition={{
											duration: 25,
											repeat: Infinity,
											ease: "linear",
										}}
									/>
								</>
							)}

							{/* Main image container */}
							<div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96">
								{/* Glass frame */}
								<div className="absolute inset-0 rounded-2xl glass-beige glow-beige" />

								{/* Image */}
								<div className="relative w-full h-full p-2">
									<Image
										src="/images/sujan.jpg"
										alt="Sujan Shrestha portrait"
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
			</motion.div>

			{/* Scroll indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.5 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2"
			>
				<motion.div
					animate={{ y: [0, 10, 0] }}
					transition={{ duration: 2, repeat: Infinity }}
					className="w-6 h-10 rounded-full border-2 border-beige-accent/30 flex justify-center pt-2"
				>
					<motion.div className="w-1 h-2 rounded-full bg-beige-accent" />
				</motion.div>
			</motion.div>
		</section>
	);
}
