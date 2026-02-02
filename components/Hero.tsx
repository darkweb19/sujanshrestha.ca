"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function Hero() {
	const containerRef = useRef<HTMLElement>(null);
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
			className="relative min-h-screen flex items-center justify-center overflow-hidden"
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

				{/* Floating orbs */}
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
				<motion.div
					className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-beige-deep/10 blur-[80px]"
					animate={{
						x: [0, 30, 0],
						y: [0, -40, 0],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			</div>

			{/* Content */}
			<motion.div
				style={{ y, opacity }}
				className="relative z-10 section-container text-center"
			>
				<motion.div
					initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="mb-8"
				>
					{/* Profile Image */}
					<motion.div
						className="relative inline-block mb-8"
						whileHover={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						<div className="relative w-40 h-40 mx-auto">
							{/* Glow effect */}
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-start via-primary-end to-beige-highlight opacity-50 blur-xl" />

							{/* Glass frame */}
							<div className="relative w-full h-full rounded-2xl glass-beige p-1 glow-beige">
								<Image
									src="/images/sujan.jpg"
									alt="Sujan Shrestha portrait"
									width={160}
									height={160}
									className="rounded-xl object-cover w-full h-full"
									priority
									unoptimized
								/>
							</div>
						</div>
					</motion.div>

					{/* Greeting */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="text-beige-highlight font-mono text-sm tracking-wider mb-4"
					>
						&#47;&#47; HELLO WORLD
					</motion.p>
				</motion.div>

				{/* Name */}
				<motion.h1
					initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.8, delay: 0.5 }}
					className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
				>
					<span className="gradient-text">Sujan Shrestha</span>
				</motion.h1>

				{/* Tagline */}
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.7 }}
					className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto mb-10"
				>
					Software Engineer passionate about creating{" "}
					<span className="text-beige-highlight">
						beautiful products
					</span>{" "}
					that{" "}
					<span className="text-primary-start">Empower People</span>
				</motion.p>

				{/* CTA Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.9 }}
					className="flex flex-wrap justify-center gap-4"
				>
					{/* Primary Button */}
					<MagneticButton>
						<a
							href="https://sujansthadev-resume2.s3.us-east-1.amazonaws.com/Sujan+Shrestha+dev.pdf"
							target="_blank"
							rel="noopener noreferrer"
							className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-start to-primary-end text-bg-0 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(176,137,104,0.4)]"
						>
							<span className="relative z-10">Download CV</span>
							<svg
								className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1"
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
					</MagneticButton>

					{/* Secondary Button */}
					<MagneticButton>
						<a
							href="#contact"
							className="group relative inline-flex items-center gap-2 px-8 py-4 glass-beige text-beige-highlight font-semibold rounded-xl transition-all duration-300 hover:bg-beige-highlight/10"
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
					</MagneticButton>
				</motion.div>
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

// Magnetic Button Component
function MagneticButton({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		ref.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
	};

	const handleMouseLeave = () => {
		if (!ref.current) return;
		ref.current.style.transform = "translate(0px, 0px)";
	};

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className="transition-transform duration-200 ease-out"
		>
			{children}
		</motion.div>
	);
}
