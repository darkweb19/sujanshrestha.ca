"use client";

import { motion } from "framer-motion";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="py-12 bg-bg-0 border-t border-glass-border">
			<div className="section-container">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					{/* Logo and Copyright */}
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="flex flex-col items-center md:items-start gap-2"
					>
						<span className="text-xl font-bold gradient-text">
							Sujan Shrestha
						</span>
						<p className="text-text-dim text-sm">
							Made with Next.js • All Rights Reserved ©{" "}
							{currentYear}
						</p>
					</motion.div>

					{/* Quick Links */}
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="flex items-center gap-6"
					>
						<a
							href="#home"
							className="text-text-muted hover:text-beige-highlight transition-colors text-sm"
						>
							Home
						</a>
						<a
							href="#projects"
							className="text-text-muted hover:text-beige-highlight transition-colors text-sm"
						>
							Projects
						</a>
						<a
							href="/blog"
							className="text-text-muted hover:text-beige-highlight transition-colors text-sm"
						>
							Blog
						</a>
						<a
							href="https://github.com/darkweb19"
							target="_blank"
							rel="noopener noreferrer"
							className="text-text-muted hover:text-beige-highlight transition-colors text-sm"
						>
							GitHub
						</a>
					</motion.div>

					{/* Back to top */}
					<motion.a
						href="#home"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						whileHover={{ y: -2 }}
						className="flex items-center gap-2 text-text-dim hover:text-beige-highlight transition-colors text-sm"
					>
						<span>Back to top</span>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 10l7-7m0 0l7 7m-7-7v18"
							/>
						</svg>
					</motion.a>
				</div>
			</div>
		</footer>
	);
}
