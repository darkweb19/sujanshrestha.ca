"use client";

import { useEffect } from "react";

/** A small progressive enhancement for coarse mouse wheels on the homepage. */
export default function SmoothScroll() {
	useEffect(() => {
		const preference = window.matchMedia(
			"(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
		);
		let frame = 0;
		let target = window.scrollY;
		let position = window.scrollY;
		let lastTime = 0;
		let precisionUntil = 0;
		const maximum = () =>
			Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		const stop = () => {
			cancelAnimationFrame(frame);
			frame = 0;
			lastTime = 0;
			target = window.scrollY;
			position = window.scrollY;
		};
		const nativeRegion = (event: WheelEvent) => {
			if (
				document.querySelector("dialog[open]") ||
				document.body.style.overflow === "hidden"
			)
				return true;
			for (const node of event.composedPath()) {
				if (
					!(node instanceof HTMLElement) ||
					node === document.body ||
					node === document.documentElement
				)
					continue;
				if (
					node.matches(
						'input, textarea, select, [contenteditable="true"], [data-native-scroll]',
					)
				)
					return true;
				if (
					node.scrollHeight > node.clientHeight + 1 &&
					/auto|scroll/.test(getComputedStyle(node).overflowY)
				)
					return true;
			}
			return false;
		};
		const animate = (now: number) => {
			if (
				!preference.matches ||
				document.hidden ||
				document.querySelector("dialog[open]")
			) {
				stop();
				return;
			}
			target = Math.max(0, Math.min(target, maximum()));
			const difference = target - position;
			if (Math.abs(difference) < 0.75) {
				window.scrollTo({ top: target, behavior: "instant" });
				stop();
				return;
			}
			const elapsed = lastTime ? Math.min(64, now - lastTime) : 16.67;
			lastTime = now;
			position += difference * (1 - Math.exp(-elapsed / 65));
			window.scrollTo({
				top: position,
				behavior: "instant",
			});
			frame = requestAnimationFrame(animate);
		};
		const wheel = (event: WheelEvent) => {
			if (
				event.defaultPrevented ||
				!event.cancelable ||
				event.ctrlKey ||
				event.metaKey ||
				event.altKey ||
				event.shiftKey ||
				Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
				nativeRegion(event)
			) {
				stop();
				return;
			}
			// Precise wheel/trackpad gestures retain the browser's own inertia.
			const now = performance.now();
			if (
				event.deltaMode === 0 &&
				(Math.abs(event.deltaY) < 50 || !Number.isInteger(event.deltaY))
			) {
				precisionUntil = now + 400;
				stop();
				return;
			}
			if (now < precisionUntil || !event.deltaY) {
				stop();
				return;
			}
			const delta =
				event.deltaY *
				(event.deltaMode === 1
					? 16
					: event.deltaMode === 2
						? window.innerHeight
						: 1);
			const next = Math.max(
				0,
				Math.min((frame ? target : window.scrollY) + delta, maximum()),
			);
			if (next === window.scrollY) {
				stop();
				return;
			}
			event.preventDefault();
			if (!frame) position = window.scrollY;
			target = next;
			if (!frame) frame = requestAnimationFrame(animate);
		};
		const synchronize = () => {
			stop();
			window.removeEventListener("wheel", wheel);
			if (preference.matches)
				window.addEventListener("wheel", wheel, { passive: false });
		};
		synchronize();
		preference.addEventListener("change", synchronize);
		window.addEventListener("keydown", stop);
		window.addEventListener("pointerdown", stop, { passive: true });
		window.addEventListener("touchstart", stop, { passive: true });
		window.addEventListener("click", stop);
		window.addEventListener("resize", stop);
		document.addEventListener("visibilitychange", stop);
		return () => {
			stop();
			window.removeEventListener("wheel", wheel);
			preference.removeEventListener("change", synchronize);
			window.removeEventListener("keydown", stop);
			window.removeEventListener("pointerdown", stop);
			window.removeEventListener("touchstart", stop);
			window.removeEventListener("click", stop);
			window.removeEventListener("resize", stop);
			document.removeEventListener("visibilitychange", stop);
		};
	}, []);
	return null;
}
