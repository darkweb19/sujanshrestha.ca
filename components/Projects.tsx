"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const projects = [
	{
		title: "ATSResumie",
		description:
			"AI-powered resume builder that analyzes job descriptions and optimizes resumes for ATS compatibility. Features real-time PDF generation and smart suggestions.",
		tech: ["Next.js", "TypeScript", "Supabase", "OpenAI", "AWS Lambda"],
		url: "https://atsresumie.com",
		featured: true,
	},
	{
		title: "Fetchany",
		description:
			"A simple web app that fetches data from an API and displays it in visually appealing formats.",
		tech: ["TypeScript", "Next.js", "PostgreSQL"],
		url: "https://fetchany.sujansthadev.com.np/",
		featured: false,
	},
	{
		title: "Optics-lens Frontend",
		description:
			"Frontend project showcasing an E-commerce platform with visually appealing design.",
		tech: ["TypeScript", "React", "CSS"],
		url: "https://opticlens.sujansthadev.com.np/",
		featured: false,
	},
	{
		title: "Create-mytech CLI",
		description:
			"CLI tool to generate a boilerplate Full-Stack codebase, helping developers quickly scaffold projects.",
		tech: ["TypeScript", "Node.js", "CLI"],
		url: "https://www.npmjs.com/package/create-mytech",
		featured: false,
	},
	{
		title: "Finance Wanabee",
		description:
			"A Finance Management system that tracks expenses and provides basic functionality for managing finances.",
		tech: ["Next.js", "Prisma", "PostgreSQL", "TypeScript"],
		url: "https://finance.sujansthadev.com.np/",
		featured: false,
	},
	{
		title: "Threads-Backend",
		description:
			"The heart of Threads, a backend server crafted with Node.js, GraphQL, PostgreSQL, and Prisma.",
		tech: ["TypeScript", "Node.js", "GraphQL", "Prisma", "PostgreSQL"],
		url: "#",
		featured: false,
	},
];

export default function Projects() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	const featuredProject = projects.find((p) => p.featured);
	const otherProjects = projects.filter((p) => !p.featured);

	return (
		<section ref={ref} id="projects" className="py-32 relative">
			<div className="section-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						/creations
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary">
						Featured <span className="gradient-text">Projects</span>
					</h3>
				</motion.div>

				{/* Featured Project - ATSResumie */}
				{featuredProject && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mb-12"
					>
						<a
							href={featuredProject.url}
							target="_blank"
							rel="noopener noreferrer"
							className="group block"
						>
							<div className="relative rounded-2xl p-8 bg-gradient-to-br from-beige-deep/10 to-bg-1 border border-beige-deep/20 transition-all duration-300 hover:border-beige-deep/40 hover:shadow-[0_8px_40px_rgba(176,137,104,0.12)]">
								{/* Featured Badge - removed animate-pulse */}
								<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beige-highlight/10 text-beige-highlight text-xs font-mono mb-6">
									<span className="w-2 h-2 rounded-full bg-beige-highlight" />
									Featured Project
								</div>

								<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
									<div className="flex-1">
										<h4 className="text-2xl md:text-3xl font-bold text-text-primary group-hover:text-beige-highlight transition-colors mb-4">
											{featuredProject.title}
										</h4>
										<p className="text-text-muted leading-relaxed mb-6 max-w-2xl">
											{featuredProject.description}
										</p>
										<div className="flex flex-wrap gap-2">
											{featuredProject.tech.map(
												(tech) => (
													<span
														key={tech}
														className="text-sm font-mono px-3 py-1.5 rounded-lg bg-beige-deep/15 text-beige-accent border border-beige-deep/20"
													>
														{tech}
													</span>
												),
											)}
										</div>
									</div>

									{/* Arrow */}
									<div className="flex-shrink-0">
										<div className="w-14 h-14 rounded-xl bg-beige-deep/10 flex items-center justify-center group-hover:bg-beige-deep/20 transition-colors">
											<svg
												className="w-6 h-6 text-beige-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
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
									</div>
								</div>
							</div>
						</a>
					</motion.div>
				)}

				{/* Other Projects Grid - simplified, no stagger animations */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{otherProjects.map((project) => (
						<ProjectCard key={project.title} project={project} />
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
	featured: boolean;
}

function ProjectCard({ project }: { project: Project }) {
	return (
		<a
			href={project.url}
			target="_blank"
			rel="noopener noreferrer"
			className="group block h-full"
		>
			<div className="relative h-full rounded-2xl p-6 bg-bg-1 border border-beige-deep/10 transition-all duration-200 hover:border-beige-deep/30 hover:shadow-[0_8px_30px_rgba(176,137,104,0.08)] hover:-translate-y-1">
				{/* Header */}
				<div className="flex items-start justify-between mb-4">
					{/* Folder Icon */}
					<div className="w-12 h-12 rounded-xl bg-beige-deep/10 flex items-center justify-center text-beige-accent group-hover:bg-beige-deep/20 transition-colors">
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
							/>
						</svg>
					</div>

					{/* External Link */}
					<svg
						className="w-5 h-5 text-text-dim group-hover:text-beige-highlight group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</div>

				{/* Title */}
				<h4 className="text-lg font-semibold text-text-primary mb-3 group-hover:text-beige-highlight transition-colors">
					{project.title}
				</h4>

				{/* Description */}
				<p className="text-text-muted text-sm mb-6 line-clamp-3 leading-relaxed">
					{project.description}
				</p>

				{/* Tech Stack */}
				<div className="flex flex-wrap gap-2 mt-auto">
					{project.tech.map((tech) => (
						<span
							key={tech}
							className="text-xs font-mono px-2.5 py-1 rounded-md bg-bg-2/50 text-text-dim group-hover:text-beige-accent transition-colors"
						>
							{tech}
						</span>
					))}
				</div>
			</div>
		</a>
	);
}
