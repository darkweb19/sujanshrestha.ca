"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const experiences = [
	{
		id: "exp-001",
		title: "Backend Developer",
		type: "Part-time/Contract",
		company: "NextUnicorn",
		location: "Remote",
		period: "April 2025 – Oct 2025",
		status: "ACTIVE",
		technologies: [
			"TypeScript",
			"Node.js",
			"Next.js",
			"Docker",
			"Jest",
			"PostgreSQL",
			"Supabase",
		],
		highlights: [
			"Worked on backend microservice architecture with a focus on the Authentication Microservice",
			"Implemented secure user authentication flows and authorization protocols",
			"Wrote test cases for authentication microservice endpoints using Supertest",
			"Collaborated with the DevOps team to streamline deployment processes",
		],
	},
	{
		id: "exp-002",
		title: "Frontend Developer Intern",
		type: "Internship",
		company: "Dobaato",
		location: "Remote",
		period: "Jan 2025 – May 2025",
		status: "COMPLETED",
		technologies: [
			"TypeScript",
			"React.js",
			"Next.js",
			"Redux",
			"Docker",
			"Supabase",
			"PostgreSQL",
		],
		highlights: [
			"Built Dobaato's landing page and integrated a CMS for blogs and career section",
			"Saahitt Project: Integrated Django backend with Next.js frontend",
			"Collaborated with UI/UX team to align frontend with design requirements",
			"Assisted in SEO optimization and content structuring for organic reach",
		],
	},
	{
		id: "exp-003",
		title: "Open-Source Contributor",
		type: "Contributor",
		company: "KeepReact",
		location: "Remote",
		period: "Sept 2023 – Nov 2023",
		status: "COMPLETED",
		technologies: ["React", "TypeScript", "CSS", "Git"],
		highlights: [
			"Resolved UX issue by fixing avatar image group redirection behavior",
			"Contributed improvements to frontend UI for better usability",
		],
	},
];

export default function Experience() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [activeExp, setActiveExp] = useState(experiences[0].id);

	return (
		<section ref={ref} id="experience" className="py-32 relative bg-bg-1">
			<div className="section-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						/experience
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary">
						Work <span className="gradient-text">Experience</span>
					</h3>
				</motion.div>

				{/* Terminal-style Experience Display */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="relative"
				>
					{/* Terminal Window */}
					<div className="rounded-2xl overflow-hidden border border-beige-deep/20 bg-bg-0/80 backdrop-blur-sm">
						{/* Terminal Header */}
						<div className="flex items-center gap-2 px-4 py-3 bg-bg-2/50 border-b border-beige-deep/10">
							<div className="flex gap-2">
								<div className="w-3 h-3 rounded-full bg-coffee/60" />
								<div className="w-3 h-3 rounded-full bg-beige-accent/60" />
								<div className="w-3 h-3 rounded-full bg-beige-highlight/60" />
							</div>
							<span className="ml-4 font-mono text-xs text-text-dim">
								sujan@portfolio:~/experience
							</span>
						</div>

						{/* Terminal Body */}
						<div className="p-6 md:p-8">
							{/* Command Line */}
							<div className="font-mono text-sm mb-6">
								<span className="text-beige-highlight">➜</span>{" "}
								<span className="text-mocha">~</span>{" "}
								<span className="text-text-muted">
									cat experience.json
								</span>
							</div>

							{/* Experience Tabs */}
							<div className="flex flex-wrap gap-2 mb-8">
								{experiences.map((exp) => (
									<button
										key={exp.id}
										onClick={() => setActiveExp(exp.id)}
										className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 hover:scale-[1.02] ${
											activeExp === exp.id
												? "bg-beige-deep/20 text-beige-highlight border border-beige-deep/30"
												: "bg-bg-2/30 text-text-muted hover:text-beige-accent border border-transparent"
										}`}
									>
										{exp.company}
									</button>
								))}
							</div>

							{/* Active Experience Content */}
							{experiences
								.filter((exp) => exp.id === activeExp)
								.map((exp) => (
									<div
										key={exp.id}
										className="font-mono text-sm"
									>
										{/* JSON-style display */}
										<div className="space-y-4">
											<div className="text-text-dim">
												{"{"}
											</div>

											<div className="pl-4 md:pl-8 space-y-3">
												{/* Title */}
												<div className="flex flex-wrap gap-2">
													<span className="text-beige-accent">
														&quot;title&quot;
													</span>
													<span className="text-text-dim">
														:
													</span>
													<span className="text-beige-highlight">
														&quot;{exp.title}&quot;
													</span>
													<span className="text-text-dim">
														,
													</span>
												</div>

												{/* Company */}
												<div className="flex flex-wrap gap-2">
													<span className="text-beige-accent">
														&quot;company&quot;
													</span>
													<span className="text-text-dim">
														:
													</span>
													<span className="text-primary-start">
														&quot;{exp.company}
														&quot;
													</span>
													<span className="text-text-dim">
														,
													</span>
												</div>

												{/* Type */}
												<div className="flex flex-wrap gap-2">
													<span className="text-beige-accent">
														&quot;type&quot;
													</span>
													<span className="text-text-dim">
														:
													</span>
													<span className="text-text-muted">
														&quot;{exp.type}&quot;
													</span>
													<span className="text-text-dim">
														,
													</span>
												</div>

												{/* Period */}
												<div className="flex flex-wrap gap-2">
													<span className="text-beige-accent">
														&quot;period&quot;
													</span>
													<span className="text-text-dim">
														:
													</span>
													<span className="text-text-muted">
														&quot;{exp.period}&quot;
													</span>
													<span className="text-text-dim">
														,
													</span>
												</div>

												{/* Status */}
												<div className="flex flex-wrap items-center gap-2">
													<span className="text-beige-accent">
														&quot;status&quot;
													</span>
													<span className="text-text-dim">
														:
													</span>
													<span
														className={`px-2 py-0.5 rounded text-xs ${
															exp.status ===
															"ACTIVE"
																? "bg-beige-highlight/20 text-beige-highlight"
																: "bg-mocha/20 text-mocha"
														}`}
													>
														{exp.status}
													</span>
													<span className="text-text-dim">
														,
													</span>
												</div>

												{/* Technologies */}
												<div>
													<div className="flex flex-wrap gap-2 mb-2">
														<span className="text-beige-accent">
															&quot;stack&quot;
														</span>
														<span className="text-text-dim">
															: [
														</span>
													</div>
													<div className="pl-4 flex flex-wrap gap-2">
														{exp.technologies.map(
															(tech) => (
																<span
																	key={tech}
																	className="px-3 py-1 rounded-lg bg-beige-deep/10 text-beige-accent text-xs border border-beige-deep/20"
																>
																	{tech}
																</span>
															),
														)}
													</div>
													<div className="text-text-dim mt-2">
														],
													</div>
												</div>

												{/* Highlights */}
												<div>
													<div className="flex flex-wrap gap-2 mb-2">
														<span className="text-beige-accent">
															&quot;highlights&quot;
														</span>
														<span className="text-text-dim">
															: [
														</span>
													</div>
													<div className="pl-4 space-y-2">
														{exp.highlights.map(
															(highlight, i) => (
																<div
																	key={i}
																	className="flex items-start gap-2"
																>
																	<span className="text-beige-highlight mt-1">
																		▹
																	</span>
																	<span className="text-text-muted">
																		&quot;
																		{
																			highlight
																		}
																		&quot;
																	</span>
																	{i <
																		exp
																			.highlights
																			.length -
																			1 && (
																		<span className="text-text-dim">
																			,
																		</span>
																	)}
																</div>
															),
														)}
													</div>
													<div className="text-text-dim mt-2">
														]
													</div>
												</div>
											</div>

											<div className="text-text-dim">
												{"}"}
											</div>
										</div>
									</div>
								))}

							{/* Blinking cursor - simplified, no infinite animation */}
							<div className="mt-6 font-mono text-sm flex items-center gap-2">
								<span className="text-beige-highlight">➜</span>
								<span className="text-mocha">~</span>
								<span className="w-2 h-4 bg-beige-highlight inline-block" />
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
