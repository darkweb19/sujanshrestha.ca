"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
	{
		id: "exp-000",
		title: "Founding AI Engineer",
		type: "Permanent Full-time",
		company: "Atsresumie",
		location: "Toronto, ON",
		period: "Jan 2026 – Present",
		status: "ACTIVE",
		technologies: [
			"TypeScript",
			"Node.js",
			"React",
			"Docker",
			"GitHub Actions",
			"REST APIs",
		],
		highlights: [
			"Architected and built scalable REST APIs and microservices using Node.js and TypeScript, establishing foundation for platform growth",
			"Developed comprehensive component architecture and shared systems enabling cross-functional teams to build features independently",
			"Built full-stack features ensuring seamless integration between frontend React applications and backend services",
			"Implemented containerized services using Docker with CI/CD pipelines via GitHub Actions, improving deployment reliability and developer experience",
			"Designed automated generation pipeline transforming user inputs into structured outputs, optimizing performance for growing user base",
			"Led end-to-end development lifecycle from system design through deployment, collaborating closely with stakeholders to translate requirements into technical solutions",
		],
	},
	{
		id: "exp-001",
		title: "Backend Developer",
		type: "Part-time/Contract",
		company: "NextUnicorn",
		location: "Remote",
		period: "April 2025 – Oct 2025",
		status: "COMPLETED",
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

	return (
		<section ref={ref} id="experience" className="py-32 relative bg-bg-1">
			<div className="section-container">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						02 — Experience
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary">
						Work <span className="gradient-text">Experience</span>
					</h3>
				</m.div>

				{/* Editorial index */}
				<div className="border-t border-beige-deep/10">
					{experiences.map((exp, i) => (
						<m.div
							key={exp.id}
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-80px" }}
							transition={{ duration: 0.5, delay: i * 0.08 }}
							className="group border-b border-beige-deep/10 py-10 md:grid md:grid-cols-[140px_1fr] md:gap-10 md:py-12"
						>
							{/* Left rail */}
							<div className="mb-5 flex items-baseline gap-4 md:mb-0 md:block">
								<span className="font-mono text-2xl font-semibold text-beige-deep/25 transition-colors group-hover:text-beige-deep/50 md:text-4xl">
									{String(i + 1).padStart(2, "0")}
								</span>
								<div className="md:mt-2">
									<p className="font-mono text-xs leading-relaxed text-text-dim">
										{exp.period}
									</p>
									{exp.status === "ACTIVE" && (
										<span className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-beige-highlight">
											<span className="h-1.5 w-1.5 rounded-full bg-beige-highlight" />
											Now
										</span>
									)}
								</div>
							</div>

							{/* Right column */}
							<div>
								<h4 className="text-xl font-semibold text-text-primary md:text-2xl">
									{exp.title}{" "}
									<span className="text-beige-highlight">
										· {exp.company}
									</span>
								</h4>
								<p className="mt-1 font-mono text-xs text-text-dim">
									{exp.type} · {exp.location}
								</p>

								<ul className="mt-5 space-y-2">
									{exp.highlights.map((highlight, j) => (
										<li
											key={j}
											className="flex items-start gap-2"
										>
											<span className="mt-0.5 text-beige-highlight">
												▹
											</span>
											<span className="text-sm leading-relaxed text-text-muted">
												{highlight}
											</span>
										</li>
									))}
								</ul>

								<div className="mt-6 flex flex-wrap gap-2">
									{exp.technologies.map((tech) => (
										<span
											key={tech}
											className="text-xs font-mono px-2.5 py-1 rounded-md border border-beige-deep/15 text-beige-accent"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						</m.div>
					))}
				</div>
			</div>
		</section>
	);
}
