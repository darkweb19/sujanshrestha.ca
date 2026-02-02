"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const experiences = [
	{
		id: "exp-001",
		title: "Full-Stack Developer",
		company: "Freelance",
		type: "Remote",
		period: "2023 - Present",
		status: "ACTIVE",
		technologies: [
			"Next.js",
			"TypeScript",
			"AWS Lambda",
			"Docker",
			"PostgreSQL",
		],
		highlights: [
			"Building scalable web applications with modern cloud architecture",
			"Developing serverless solutions and RESTful APIs",
			"Creating CLI tools published on NPM (create-mytech)",
			"Implementing CI/CD pipelines and DevOps best practices",
		],
	},
	{
		id: "exp-002",
		title: "MERN Stack Developer",
		company: "Deerwalk Institute of Technology",
		type: "Bootcamp",
		period: "2023",
		status: "COMPLETED",
		technologies: ["MongoDB", "Express.js", "React", "Node.js", "GraphQL"],
		highlights: [
			"Built e-commerce platform with full CRUD operations",
			"Developed finance management system with Prisma ORM",
			"Created GraphQL backend server for social platform",
			"Implemented authentication and authorization systems",
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
					transition={{ duration: 0.6 }}
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
					transition={{ duration: 0.6, delay: 0.2 }}
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
									<motion.button
										key={exp.id}
										onClick={() => setActiveExp(exp.id)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
											activeExp === exp.id
												? "bg-beige-deep/20 text-beige-highlight border border-beige-deep/30"
												: "bg-bg-2/30 text-text-muted hover:text-beige-accent border border-transparent"
										}`}
									>
										{exp.company}
									</motion.button>
								))}
							</div>

							{/* Active Experience Content */}
							{experiences
								.filter((exp) => exp.id === activeExp)
								.map((exp) => (
									<motion.div
										key={exp.id}
										initial={{ opacity: 0, x: 10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3 }}
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
															(tech, i) => (
																<motion.span
																	key={tech}
																	initial={{
																		opacity: 0,
																		scale: 0.8,
																	}}
																	animate={{
																		opacity: 1,
																		scale: 1,
																	}}
																	transition={{
																		delay:
																			i *
																			0.05,
																	}}
																	className="px-3 py-1 rounded-lg bg-beige-deep/10 text-beige-accent text-xs border border-beige-deep/20"
																>
																	{tech}
																</motion.span>
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
																<motion.div
																	key={i}
																	initial={{
																		opacity: 0,
																		x: -10,
																	}}
																	animate={{
																		opacity: 1,
																		x: 0,
																	}}
																	transition={{
																		delay:
																			0.2 +
																			i *
																				0.1,
																	}}
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
																</motion.div>
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
									</motion.div>
								))}

							{/* Blinking cursor */}
							<motion.div
								className="mt-6 font-mono text-sm flex items-center gap-2"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.5 }}
							>
								<span className="text-beige-highlight">➜</span>
								<span className="text-mocha">~</span>
								<motion.span
									animate={{ opacity: [1, 0, 1] }}
									transition={{
										duration: 1,
										repeat: Infinity,
									}}
									className="w-2 h-4 bg-beige-highlight inline-block"
								/>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
