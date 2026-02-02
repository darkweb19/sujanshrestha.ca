"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRef, MouseEvent } from "react";

const projects = [
	{
		title: "Fetchany",
		description:
			"A simple web app that fetches data from an API and displays it in visually appealing formats.",
		tech: ["TypeScript", "Next.js", "PostgreSQL"],
		url: "https://fetchany.sujansthadev.com.np/",
		gradient: "from-primary-start to-primary-end",
	},
	{
		title: "Optics-lens Frontend",
		description:
			"Frontend project showcasing an E-commerce platform with visually appealing design.",
		tech: ["TypeScript", "React", "CSS"],
		url: "https://opticlens.sujansthadev.com.np/",
		gradient: "from-beige-deep to-beige-accent",
	},
	{
		title: "Create-mytech CLI",
		description:
			"CLI tool to generate a boilerplate Full-Stack codebase, helping developers quickly scaffold projects.",
		tech: ["TypeScript", "Node.js", "CLI"],
		url: "https://www.npmjs.com/package/create-mytech",
		gradient: "from-primary-end to-beige-highlight",
	},
	{
		title: "Finance Wanabee",
		description:
			"A Finance Management system that tracks expenses and provides basic functionality for managing finances.",
		tech: ["Next.js", "Prisma", "PostgreSQL", "TypeScript"],
		url: "https://finance.sujansthadev.com.np/",
		gradient: "from-accent-cyan to-primary-start",
	},
	{
		title: "Threads-Backend",
		description:
			"The heart of Threads, a backend server crafted with Node.js, GraphQL, PostgreSQL, and Prisma.",
		tech: ["TypeScript", "Node.js", "GraphQL", "Prisma", "PostgreSQL"],
		url: "#",
		gradient: "from-beige-accent to-primary-start",
	},
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.6 },
	},
};

export default function Projects() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section ref={ref} id="projects" className="py-32 relative bg-bg-1">
			<div className="section-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						/creations
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary">
						Featured <span className="gradient-text">Projects</span>
					</h3>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={isInView ? "visible" : "hidden"}
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{projects.map((project, index) => (
						<motion.div key={project.title} variants={itemVariants}>
							<ProjectCard project={project} index={index} />
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

interface Project {
	title: string;
	description: string;
	tech: string[];
	url: string;
	gradient: string;
}

function ProjectCard({ project }: { project: Project; index: number }) {
	const cardRef = useRef<HTMLDivElement>(null);

	// 3D tilt effect
	const rotateX = useMotionValue(0);
	const rotateY = useMotionValue(0);

	const springConfig = { stiffness: 300, damping: 30 };
	const rotateXSpring = useSpring(rotateX, springConfig);
	const rotateYSpring = useSpring(rotateY, springConfig);

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const x = e.clientX - centerX;
		const y = e.clientY - centerY;

		rotateX.set((y / rect.height) * -10);
		rotateY.set((x / rect.width) * 10);
	};

	const handleMouseLeave = () => {
		rotateX.set(0);
		rotateY.set(0);
	};

	return (
		<motion.div
			ref={cardRef}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{
				rotateX: rotateXSpring,
				rotateY: rotateYSpring,
				transformPerspective: 1000,
			}}
			className="group relative h-full"
		>
			{/* Animated border gradient */}
			<div
				className={`absolute -inset-[1px] bg-gradient-to-r ${project.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`}
			/>

			{/* Card */}
			<a
				href={project.url}
				target="_blank"
				rel="noopener noreferrer"
				className="relative block h-full glass rounded-2xl p-6 overflow-hidden transition-all duration-300 group-hover:bg-glass-bg"
			>
				{/* Spotlight effect */}
				<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
					<div
						className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-5`}
					/>
				</div>

				{/* Content */}
				<div className="relative z-10">
					<div className="flex items-start justify-between mb-4">
						<h4 className="text-xl font-semibold text-text-primary group-hover:text-beige-highlight transition-colors">
							{project.title}
						</h4>
						<svg
							className="w-5 h-5 text-text-dim group-hover:text-beige-highlight group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
					</div>

					<p className="text-text-muted text-sm mb-6 line-clamp-3">
						{project.description}
					</p>

					{/* Tech tags */}
					<motion.div
						className="flex flex-wrap gap-2"
						initial={false}
					>
						{project.tech.map((tech, i) => (
							<motion.span
								key={tech}
								initial={{ opacity: 1 }}
								whileHover={{ scale: 1.05 }}
								transition={{ delay: i * 0.05 }}
								className="text-xs px-3 py-1 rounded-full bg-bg-2/50 text-text-dim group-hover:text-beige-accent group-hover:bg-beige-deep/10 transition-all"
							>
								{tech}
							</motion.span>
						))}
					</motion.div>
				</div>
			</a>
		</motion.div>
	);
}
