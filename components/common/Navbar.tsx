"use client";

import { m, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
	{ name: "Home", href: "/#home", id: "home" },
	{ name: "About", href: "/#about", id: "about" },
	{ name: "Experience", href: "/#experience", id: "experience" },
	{ name: "Projects", href: "/#projects", id: "projects" },
	{ name: "Academics", href: "/#academics", id: "academics" },
	{ name: "Contact", href: "/#contact", id: "contact" },
];

export default function Navbar() {
	const [hidden, setHidden] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [active, setActive] = useState("");

	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		const previous = scrollY.getPrevious() ?? 0;
		if (latest > previous && latest > 150) {
			setHidden(true);
			setMobileOpen(false);
		} else {
			setHidden(false);
		}
	});

	useEffect(() => {
		const elements = navLinks
			.map((link) => document.getElementById(link.id))
			.filter((el): el is HTMLElement => el !== null);

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting);
				if (visible.length > 0) {
					setActive(visible[0].target.id);
				}
			},
			{ rootMargin: "-40% 0px -55% 0px" }
		);

		elements.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, []);

	return (
		<div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
			<m.nav
				variants={{
					visible: { y: 0, opacity: 1 },
					hidden: { y: -80, opacity: 0 },
				}}
				animate={hidden ? "hidden" : "visible"}
				transition={{ duration: 0.35, ease: "easeInOut" }}
				className="relative"
			>
				<div className="glass shadow-card rounded-full border border-glass-border flex items-center gap-1 pl-4 pr-2 py-2">
					{/* Monogram */}
					<Link
						href="/#home"
						className="font-mono text-sm font-semibold text-coffee tracking-tight"
					>
						SS
					</Link>

					{/* Separator */}
					<span className="hidden md:block h-4 w-px bg-black/10 mx-1" />

					{/* Desktop links */}
					<div className="hidden md:flex items-center gap-0.5">
						{navLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
									active === link.id
										? "text-coffee bg-coffee/10"
										: "text-text-muted hover:text-text-primary"
								}`}
							>
								{link.name}
							</a>
						))}
					</div>

					{/* Blog */}
					<Link
						href="/blogs"
						className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-coffee hover:bg-coffee/10 transition-colors"
					>
						<span>Blog</span>
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</Link>

					{/* Mobile menu button */}
					<m.button
						whileTap={{ scale: 0.95 }}
						onClick={() => setMobileOpen(!mobileOpen)}
						className="md:hidden flex flex-col gap-1 p-1.5"
						aria-label="Toggle menu"
					>
						<m.span
							animate={
								mobileOpen
									? { rotate: 45, y: 5 }
									: { rotate: 0, y: 0 }
							}
							className="w-5 h-0.5 bg-text-primary rounded-full"
						/>
						<m.span
							animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
							className="w-5 h-0.5 bg-text-primary rounded-full"
						/>
						<m.span
							animate={
								mobileOpen
									? { rotate: -45, y: -5 }
									: { rotate: 0, y: 0 }
							}
							className="w-5 h-0.5 bg-text-primary rounded-full"
						/>
					</m.button>
				</div>

				{/* Mobile dropdown */}
				<m.div
					initial={false}
					animate={
						mobileOpen
							? { opacity: 1, y: 0, pointerEvents: "auto" }
							: { opacity: 0, y: -8, pointerEvents: "none" }
					}
					transition={{ duration: 0.2 }}
					className="md:hidden absolute left-1/2 -translate-x-1/2 mt-3 w-64"
				>
					<div className="glass shadow-card rounded-2xl p-2 flex flex-col">
						{navLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								onClick={() => setMobileOpen(false)}
								className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
									active === link.id
										? "text-coffee bg-coffee/10"
										: "text-text-muted hover:text-text-primary hover:bg-coffee/5"
								}`}
							>
								{link.name}
							</a>
						))}
						<Link
							href="/blogs"
							onClick={() => setMobileOpen(false)}
							className="px-4 py-2.5 rounded-xl text-sm font-medium text-coffee hover:bg-coffee/10 transition-colors"
						>
							Blog
						</Link>
					</div>
				</m.div>
			</m.nav>
		</div>
	);
}
