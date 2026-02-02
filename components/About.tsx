"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
	{ name: "Next.js", icon: "▲" },
	{ name: "TypeScript", icon: "TS" },
	{ name: "React", icon: "⚛" },
	{ name: "Node.js", icon: "⬢" },
	{ name: "AWS", icon: "☁" },
	{ name: "Docker", icon: "🐳" },
	{ name: "PostgreSQL", icon: "🐘" },
	{ name: "MongoDB", icon: "🍃" },
	{ name: "GraphQL", icon: "◈" },
	{ name: "Linux", icon: "🐧" },
	{ name: "GitHub", icon: "⬡" },
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.5 },
	},
};

export default function About() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section ref={ref} id="about" className="py-32 relative">
			<div className="section-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						/statement
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary mb-8">
						About <span className="gradient-text">Me</span>
					</h3>
				</motion.div>

				<div className="grid lg:grid-cols-2 gap-16">
					{/* Bio */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<div className="glass rounded-2xl p-8 glow-primary h-full">
							<p className="text-text-muted text-lg leading-relaxed mb-6">
								I have completed my bootcamp course in the MERN
								stack from{" "}
								<a
									href="https://deerwalk.edu.np/DWIT/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-beige-highlight hover:text-beige-accent transition-colors underline underline-offset-4"
								>
									Deerwalk Institute
								</a>
								. At the same time, I am pursuing my Diploma
								degree in Computer System Technician at{" "}
								<a
									href="https://loyalistcollege.com/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-start hover:text-primary-end transition-colors underline underline-offset-4"
								>
									Loyalist College
								</a>
								, Toronto, CA.
							</p>
							<p className="text-text-muted text-lg leading-relaxed">
								I&apos;m passionate about building scalable web
								applications, exploring serverless architectures
								with AWS Lambda, and following best practices in
								DevOps and cloud infrastructure.
							</p>
						</div>
					</motion.div>

					{/* Skills Grid */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate={isInView ? "visible" : "hidden"}
					>
						<h4 className="text-text-dim text-sm font-mono mb-6 tracking-wider">
							TECHNOLOGIES I WORK WITH
						</h4>
						<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
							{skills.map((skill) => (
								<motion.div
									key={skill.name}
									variants={itemVariants}
									whileHover={{ scale: 1.05, y: -2 }}
									className="group glass-beige rounded-xl p-4 text-center cursor-default transition-all duration-300 hover:bg-beige-highlight/5"
								>
									<span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">
										{skill.icon}
									</span>
									<span className="text-text-muted text-sm group-hover:text-beige-highlight transition-colors">
										{skill.name}
									</span>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
