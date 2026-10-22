"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The server owns the content; this island only adds optional pointer depth. */
export default function HeroCanvas({ children }: { children: ReactNode }) {
	const canvas = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = canvas.current;
		if (!element) return;
		const preference = window.matchMedia(
			"(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
		);
		let visible = true;
		let frame = 0;
		let pointerX = 0;
		let pointerY = 0;
		const reset = () => {
			cancelAnimationFrame(frame);
			frame = 0;
			element.style.setProperty("--hero-x", "0px");
			element.style.setProperty("--hero-y", "0px");
		};
		const move = (event: PointerEvent) => {
			if (!preference.matches || !visible || document.hidden) return;
			pointerX = event.clientX;
			pointerY = event.clientY;
			if (frame) return;
			frame = requestAnimationFrame(() => {
				const bounds = element.getBoundingClientRect();
				const x = Math.max(
					-1,
					Math.min(1, ((pointerX - bounds.left) / bounds.width) * 2 - 1),
				);
				const y = Math.max(
					-1,
					Math.min(1, ((pointerY - bounds.top) / bounds.height) * 2 - 1),
				);
				element.style.setProperty("--hero-x", `${x * 8}px`);
				element.style.setProperty("--hero-y", `${y * 5}px`);
				frame = 0;
			});
		};
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (!visible) reset();
		});
		observer.observe(element);
		element.addEventListener("pointermove", move, { passive: true });
		element.addEventListener("pointerleave", reset);
		preference.addEventListener("change", reset);
		return () => {
			reset();
			observer.disconnect();
			element.removeEventListener("pointermove", move);
			element.removeEventListener("pointerleave", reset);
			preference.removeEventListener("change", reset);
		};
	}, []);
	return (
		<div ref={canvas} className="hero-canvas">
			{children}
		</div>
	);
}
