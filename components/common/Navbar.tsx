"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./navigation.module.css";

const links = [
	{ name: "About", href: "/#about" },
	{ name: "Projects", href: "/#projects" },
	{ name: "Experience", href: "/#experience" },
	{ name: "Academics", href: "/#academics" },
	{ name: "Blog", href: "/blogs" },
	{ name: "Lab", href: "/lab/codex" },
	{ name: "Contact", href: "/#contact" },
];

function routeMatches(pathname: string, route: string) {
	if (route === "/lab/codex") return pathname.startsWith("/lab/");
	return pathname === route || pathname.startsWith(`${route}/`);
}

function getCurrent(link: (typeof links)[number], pathname: string, hash: string) {
	const [route, fragment] = link.href.split("#");
	if (route && route !== "/") {
		return routeMatches(pathname, route) ? "page" : undefined;
	}
	return pathname === "/" && hash === fragment ? "location" : undefined;
}

function isOrdinaryActivation(event: MouseEvent<HTMLAnchorElement>) {
	return (
		event.button === 0 &&
		!event.metaKey &&
		!event.ctrlKey &&
		!event.shiftKey &&
		!event.altKey &&
		!event.defaultPrevented
	);
}

export default function Navbar() {
	const [openForPath, setOpenForPath] = useState<string | null>(null);
	const [hash, setHash] = useState("");
	const toggle = useRef<HTMLButtonElement>(null);
	const header = useRef<HTMLElement>(null);
	const brand = useRef<HTMLAnchorElement>(null);
	const desktopNav = useRef<HTMLElement>(null);
	const mobileNav = useRef<HTMLElement>(null);
	const pathname = usePathname();
	const open = openForPath === pathname;
	const close = () => setOpenForPath(null);

	useEffect(() => {
		const syncHash = () => setHash(window.location.hash.slice(1));
		const closeOnHistoryNavigation = () => {
			syncHash();
			close();
		};
		syncHash();
		window.addEventListener("hashchange", syncHash);
		window.addEventListener("popstate", closeOnHistoryNavigation);
		return () => {
			window.removeEventListener("hashchange", syncHash);
			window.removeEventListener("popstate", closeOnHistoryNavigation);
		};
	}, []);

	useEffect(() => {
		if (!open) return;

		const closeOnOutsidePointer = (event: PointerEvent) => {
			if (
				event.target instanceof Node &&
				header.current &&
				!header.current.contains(event.target)
			) {
				close();
			}
		};

		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
	}, [open]);

	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 901px)");
		const closeAtDesktopWidth = (event: MediaQueryListEvent) => {
			if (!event.matches) return;

			const active = document.activeElement;
			const mobileLink =
				active instanceof HTMLAnchorElement && mobileNav.current?.contains(active)
					? active
					: null;
			const focusWasInMobileNavigation =
				active === toggle.current || mobileLink !== null;
			setOpenForPath(null);

			if (!focusWasInMobileNavigation) return;
			const itemName = mobileLink?.dataset.navLink;
			window.requestAnimationFrame(() => {
				if (itemName === "Home") {
					brand.current?.focus();
					return;
				}

				const desktopLinks = desktopNav.current?.querySelectorAll<HTMLAnchorElement>(
					"a[data-nav-link]",
				);
				const matchingLink = Array.from(desktopLinks ?? []).find(
					(link) => link.dataset.navLink === itemName,
				);
				(matchingLink ?? desktopLinks?.[0] ?? brand.current)?.focus();
			});
		};

		desktop.addEventListener("change", closeAtDesktopWidth);
		return () => desktop.removeEventListener("change", closeAtDesktopWidth);
	}, []);

	const handleLinkClick = (
		event: MouseEvent<HTMLAnchorElement>,
		href: string,
	) => {
		if (!isOrdinaryActivation(event)) return;
		close();
		setHash(href.split("#")[1] ?? "");
	};

	const homeCurrent =
		pathname === "/" && (hash === "" || hash === "home")
			? hash === "home"
				? "location"
				: "page"
			: undefined;

	return (
		<header
			ref={header}
			className="site-header"
			onKeyDown={(event) => {
				if (event.key === "Escape" && open) {
					event.preventDefault();
					close();
					toggle.current?.focus();
				}
			}}
		>
			<div className="section-container header-inner">
				<Link
					ref={brand}
					href="/#home"
					className={`brand-link ${styles.brand}`}
					aria-label="Sujan Shrestha home"
					aria-current={homeCurrent}
					onClick={(event) => handleLinkClick(event, "/#home")}
				>
					<Image
						src="/brand/wordmark.svg"
						alt="Sujan Shrestha"
						width={178}
						height={44}
						priority
					/>
				</Link>
				<nav ref={desktopNav} className="desktop-nav" aria-label="Primary">
					{links.map((link) => (
						<Link
							key={link.name}
							href={link.href}
							className={styles.navLink}
							data-nav-link={link.name}
							aria-current={getCurrent(link, pathname, hash)}
							onClick={(event) => handleLinkClick(event, link.href)}
						>
							{link.name}
						</Link>
					))}
				</nav>
				<button
					ref={toggle}
					className={`menu-toggle ${styles.menuToggle}`}
					type="button"
					aria-label="Toggle menu"
					aria-expanded={open}
					aria-controls="mobile-menu"
					onClick={() =>
						setOpenForPath((currentPath) =>
							currentPath === pathname ? null : pathname,
						)
					}
				>
					{open ? "Close" : "Menu"}
				</button>
			</div>
			<nav
				ref={mobileNav}
				id="mobile-menu"
				className={`mobile-nav ${styles.mobileMenu}`}
				aria-label="Mobile"
				hidden={!open}
			>
				{[
					{ name: "Home", href: "/#home" },
					...links,
				].map((link) => (
					<Link
						key={link.name}
						href={link.href}
						className={`${styles.navLink} ${styles.mobileLink}`}
						data-nav-link={link.name}
						aria-current={
							link.name === "Home"
								? pathname === "/" && (hash === "" || hash === "home")
									? "location"
									: undefined
								: getCurrent(link, pathname, hash)
						}
						onClick={(event) => handleLinkClick(event, link.href)}
					>
						{link.name}
					</Link>
				))}
			</nav>
		</header>
	);
}
