"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

export default function Contact() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [copied, setCopied] = useState(false);

	const email = "hi@sujanshrestha.ca";

	const copyEmail = async () => {
		await navigator.clipboard.writeText(email);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const socialLinks = [
		{
			name: "GitHub",
			url: "https://github.com/darkweb19",
			icon: (
				<svg
					className="w-6 h-6"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						fillRule="evenodd"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		{
			name: "LinkedIn",
			url: "https://linkedin.com/in/sujansthadev",
			icon: (
				<svg
					className="w-6 h-6"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
				</svg>
			),
		},
		{
			name: "Blog",
			url: "/blog",
			icon: (
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
					/>
				</svg>
			),
		},
	];

	return (
		<section ref={ref} id="contact" className="py-32 relative bg-bg-1">
			<div className="section-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="text-center max-w-2xl mx-auto"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						/contact
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
						Let&apos;s{" "}
						<span className="gradient-text">Connect</span>
					</h3>
					<p className="text-text-muted text-lg mb-12">
						Whether you have a project in mind, want to collaborate,
						or just want to say hello – I&apos;d love to hear from
						you!
					</p>

					{/* Email Button - simplified, no motion wrapper */}
					<div className="mb-12">
						<button
							onClick={copyEmail}
							className="group relative inline-flex items-center gap-3 px-8 py-5 glass-beige rounded-2xl text-lg font-medium text-beige-highlight transition-all duration-200 hover:bg-beige-highlight/10 hover:scale-[1.02] active:scale-[0.98]"
						>
							<svg
								className="w-6 h-6 group-hover:scale-110 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							<span>{email}</span>
							<span
								className={`ml-2 text-sm ${
									copied
										? "text-accent-cyan"
										: "text-text-dim"
								} transition-colors`}
							>
								{copied ? "Copied!" : "Click to copy"}
							</span>
						</button>
					</div>

					{/* Direct email link for accessibility */}
					<div className="mb-12">
						<a
							href={`mailto:${email}`}
							className="text-primary-start hover:text-primary-end transition-colors underline underline-offset-4"
						>
							Or send an email directly →
						</a>
					</div>

					{/* Social Links - simplified */}
					<div className="flex justify-center gap-6">
						{socialLinks.map((link) => (
							<a
								key={link.name}
								href={link.url}
								target={
									link.url.startsWith("http")
										? "_blank"
										: undefined
								}
								rel={
									link.url.startsWith("http")
										? "noopener noreferrer"
										: undefined
								}
								className="group flex items-center justify-center w-14 h-14 glass rounded-xl text-text-muted hover:text-beige-highlight hover:bg-beige-highlight/5 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
								aria-label={link.name}
							>
								{link.icon}
							</a>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
