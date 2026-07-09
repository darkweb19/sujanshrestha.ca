"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
	"Next.js",
	"TypeScript",
	"React",
	"Node.js",
	"AWS",
	"Docker",
	"PostgreSQL",
	"MongoDB",
	"GraphQL",
	"Linux",
	"GitHub",
];

export default function About() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section ref={ref} id="about" className="py-32 relative">
			<div className="section-container">
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						01 — About
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary mb-8">
						Who I <span className="gradient-text">Am</span>
					</h3>
				</m.div>

				<div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
					{/* Bio - Takes 3 columns */}
					<m.div
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.1 }}
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
								<p className="text-text-muted leading-relaxed text-md">
									I love creating clean UI, subtle animations,
									and experiences that users enjoy using every
									day — across the full stack.
								</p>
							</div>

							{/* Philosophy */}
							<div className="glass-beige rounded-2xl p-6">
								<p className="text-beige-highlight text-lg font-medium mb-2">
									My Philosophy
								</p>
								<p className="text-text-muted text-md leading-relaxed">
									If you&apos;re building something ambitious
									and want a developer who cares about both
									engineering + aesthetics, let&apos;s connect.
								</p>
							</div>
						</div>
					</m.div>

					{/* Skills Grid - Takes 2 columns */}
					<m.div
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="lg:col-span-2"
					>
						<h4 className="text-text-dim text-sm font-mono mb-6 tracking-wider">
							TECH STACK
						</h4>
						<div className="flex flex-wrap gap-2">
							{skills.map((skill) => (
								<span
									key={skill}
									className="px-3 py-1.5 rounded-lg border border-beige-deep/15 text-text-muted text-sm font-mono hover:text-beige-highlight hover:border-beige-deep/30 transition-colors"
								>
									{skill}
								</span>
							))}
						</div>
					</m.div>
				</div>
			</div>
		</section>
	);
}
