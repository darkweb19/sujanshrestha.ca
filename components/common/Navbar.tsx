"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

const navLinks = [
	{ name: "Home", href: "#home" },
	{ name: "About", href: "#about" },
	{ name: "Experience", href: "#experience" },
	{ name: "Projects", href: "#projects" },
	{ name: "Academics", href: "#academics" },
	{ name: "Contact", href: "#contact" },
];

export default function Navbar() {
	const [hidden, setHidden] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		const previous = scrollY.getPrevious() ?? 0;
		if (latest > previous && latest > 150) {
			setHidden(true);
			setMobileOpen(false);
		} else {
			setHidden(false);
		}
		setScrolled(latest > 50);
	});

	return (
		<motion.nav
			variants={{
				visible: { y: 0 },
				hidden: { y: "-100%" },
			}}
			animate={hidden ? "hidden" : "visible"}
			transition={{ duration: 0.35, ease: "easeInOut" }}
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled ? "py-3" : "py-5"
			}`}
		>
			<div className="section-container">
				<div
					className={`flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 ${
						scrolled
							? "glass backdrop-blur-md glow-primary"
							: "bg-transparent"
					}`}
				>
					{/* Logo */}
					<motion.a
						href="#home"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="text-xl font-bold gradient-text"
					>
						Sujan Shrestha
					</motion.a>

					{/* Desktop Nav */}
					<div className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<NavLink key={link.name} href={link.href}>
								{link.name}
							</NavLink>
						))}
					</div>

					{/* Blog Button */}
					<div className="hidden md:block">
						<motion.a
							href="/blog"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium glass-beige rounded-lg text-beige-highlight hover:bg-beige-highlight/10 transition-all"
						>
							<span>Blog</span>
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
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
						</motion.a>
					</div>

					{/* Mobile Menu Button */}
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => setMobileOpen(!mobileOpen)}
						className="md:hidden flex flex-col gap-1.5 p-2"
						aria-label="Toggle menu"
					>
						<motion.span
							animate={
								mobileOpen
									? { rotate: 45, y: 6 }
									: { rotate: 0, y: 0 }
							}
							className="w-6 h-0.5 bg-beige-highlight rounded-full"
						/>
						<motion.span
							animate={
								mobileOpen ? { opacity: 0 } : { opacity: 1 }
							}
							className="w-6 h-0.5 bg-beige-highlight rounded-full"
						/>
						<motion.span
							animate={
								mobileOpen
									? { rotate: -45, y: -6 }
									: { rotate: 0, y: 0 }
							}
							className="w-6 h-0.5 bg-beige-highlight rounded-full"
						/>
					</motion.button>
				</div>

				{/* Mobile Menu */}
				<motion.div
					initial={false}
					animate={
						mobileOpen
							? { height: "auto", opacity: 1 }
							: { height: 0, opacity: 0 }
					}
					transition={{ duration: 0.3 }}
					className="md:hidden overflow-hidden"
				>
					<div className="glass rounded-2xl mt-3 p-4 flex flex-col gap-2">
						{navLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								onClick={() => setMobileOpen(false)}
								className="px-4 py-3 rounded-lg text-text-muted hover:text-beige-highlight hover:bg-beige-highlight/5 transition-all"
							>
								{link.name}
							</a>
						))}
						<a
							href="/blog"
							onClick={() => setMobileOpen(false)}
							className="px-4 py-3 rounded-lg text-beige-highlight bg-beige-highlight/10"
						>
							Blog →
						</a>
					</div>
				</motion.div>
			</div>
		</motion.nav>
	);
}

function NavLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<motion.a
			href={href}
			className="group relative px-4 py-2 text-md font-bold text-text-muted hover:text-beige-highlight transition-colors"
			whileHover="hover"
		>
			{children}
			{/* Underline sweep */}
			<motion.span
				variants={{
					hover: { scaleX: 1, opacity: 1 },
				}}
				initial={{ scaleX: 0, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-primary-start to-beige-highlight origin-left"
			/>
		</motion.a>
	);
}
