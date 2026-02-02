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

const highlights = [
	{ label: "Focus", value: "Full-Stack Development" },
	{ label: "Location", value: "Toronto, Canada" },
	{ label: "Availability", value: "Open to opportunities" },
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 15 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4 },
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
						/about
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary mb-8">
						Who I <span className="gradient-text">Am</span>
					</h3>
				</motion.div>

				<div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
					{/* Bio - Takes 3 columns */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="lg:col-span-3"
					>
						<div className="space-y-6">
							{/* Main intro */}
							<div className="glass rounded-2xl p-8">
								<p className="text-xl md:text-2xl text-text-primary leading-relaxed mb-6">
									Hey — I&apos;m{" "}
									<span className="text-beige-highlight font-semibold">
										Sujan
									</span>
									. I build web apps that feel smooth, modern,
									and a little bit{" "}
									<span className="italic">
										&quot;wow.&quot;
									</span>
								</p>
								<p className="text-text-muted leading-relaxed">
									I love creating clean UI, subtle animations,
									and experiences that users enjoy using every
									day. I work across the full stack — taking
									features from idea → design → code →
									deployment.
								</p>
							</div>

							{/* Philosophy */}
							<div className="glass-beige rounded-2xl p-6">
								<div className="flex items-start gap-4">
									<span className="text-3xl">🎯</span>
									<div>
										<p className="text-beige-highlight font-medium mb-2">
											My Philosophy
										</p>
										<p className="text-text-muted text-sm leading-relaxed">
											If you&apos;re building something
											ambitious and want a developer who
											cares about both engineering +
											aesthetics, let&apos;s connect.
										</p>
									</div>
								</div>
							</div>

							{/* Quick Facts */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{highlights.map((item, i) => (
									<motion.div
										key={item.label}
										initial={{ opacity: 0, y: 20 }}
										animate={
											isInView ? { opacity: 1, y: 0 } : {}
										}
										transition={{
											duration: 0.4,
											delay: 0.4 + i * 0.1,
										}}
										className="glass rounded-xl p-4 text-center"
									>
										<p className="text-text-dim text-xs font-mono mb-1 uppercase tracking-wider">
											{item.label}
										</p>
										<p className="text-beige-accent text-sm font-medium">
											{item.value}
										</p>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>

					{/* Skills Grid - Takes 2 columns */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate={isInView ? "visible" : "hidden"}
						className="lg:col-span-2"
					>
						<h4 className="text-text-dim text-sm font-mono mb-6 tracking-wider">
							TECH STACK
						</h4>
						<div className="grid grid-cols-3 gap-3">
							{skills.map((skill) => (
								<motion.div
									key={skill.name}
									variants={itemVariants}
									whileHover={{ scale: 1.05, y: -3 }}
									className="group glass rounded-xl p-4 text-center cursor-default transition-all duration-200 hover:bg-beige-deep/10 hover:border-beige-deep/20 border border-transparent"
								>
									<span className="text-xl mb-2 block group-hover:scale-110 transition-transform duration-200">
										{skill.icon}
									</span>
									<span className="text-text-muted text-xs group-hover:text-beige-highlight transition-colors">
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
