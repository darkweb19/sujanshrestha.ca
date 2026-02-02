"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
	{
		title: "Full-Stack Developer",
		company: "Freelance / Personal Projects",
		location: "Toronto, CA",
		period: "2023 - Present",
		description: [
			"Building scalable web applications using Next.js, TypeScript, and modern cloud infrastructure",
			"Developing serverless architectures with AWS Lambda and implementing DevOps best practices",
			"Creating CLI tools and open-source packages published on NPM",
		],
		current: true,
	},
	{
		title: "MERN Stack Developer",
		company: "Deerwalk Institute of Technology",
		location: "Kathmandu, Nepal",
		period: "2023",
		description: [
			"Completed intensive bootcamp focusing on MongoDB, Express.js, React, and Node.js",
			"Built multiple full-stack projects including e-commerce platforms and finance applications",
			"Gained experience with GraphQL, Prisma ORM, and PostgreSQL databases",
		],
		current: false,
	},
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, x: -30, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		x: 0,
		filter: "blur(0px)",
		transition: { duration: 0.6 },
	},
};

export default function Experience() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

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

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={isInView ? "visible" : "hidden"}
					className="space-y-8"
				>
					{experiences.map((exp) => (
						<motion.div
							key={exp.title + exp.company}
							variants={itemVariants}
							className="group"
						>
							<div
								className={`glass rounded-2xl p-8 transition-all duration-300 hover:bg-glass-bg ${
									exp.current ? "glass-beige glow-beige" : ""
								}`}
							>
								<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
									<div>
										<div className="flex items-center gap-3 mb-2">
											<h4 className="text-xl font-semibold text-beige-highlight">
												{exp.title}
											</h4>
											{exp.current && (
												<span className="px-3 py-1 text-xs font-medium bg-primary-start/20 text-primary-end rounded-full">
													Current
												</span>
											)}
										</div>
										<p className="text-primary-start font-medium">
											{exp.company}
										</p>
										<p className="text-text-dim text-sm">
											{exp.location}
										</p>
									</div>
									<span className="text-text-dim text-sm font-mono lg:text-right">
										{exp.period}
									</span>
								</div>

								<ul className="space-y-3">
									{exp.description.map((item, i) => (
										<motion.li
											key={i}
											initial={{ opacity: 0.7 }}
											whileHover={{ opacity: 1, x: 4 }}
											className="flex items-start gap-3 text-text-muted"
										>
											<span className="text-primary-start mt-1.5">
												▹
											</span>
											<span>{item}</span>
										</motion.li>
									))}
								</ul>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
