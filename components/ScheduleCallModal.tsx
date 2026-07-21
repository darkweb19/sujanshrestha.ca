"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const APPOINTMENT_URL =
	"https://calendar.google.com/calendar/appointments/schedules/AcZssZ331o-aIQMcHXhJJauVR6l_PO4DVrWVsEUmOXRTEbi8co23c35KHsOIvXEaPa9MpWsDikVTWxVk?gv=true";

const FOCUSABLE_ELEMENTS =
	'a[href], button:not([disabled]), iframe, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ScheduleCallModal() {
	const [isOpen, setIsOpen] = useState(false);
	const titleId = useId();
	const descriptionId = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const trigger = triggerRef.current;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		closeButtonRef.current?.focus();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
				return;
			}

			if (event.key !== "Tab" || !dialogRef.current) return;

			const focusableElements = Array.from(
				dialogRef.current.querySelectorAll<HTMLElement>(
					FOCUSABLE_ELEMENTS
				)
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements.at(-1);

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement?.focus();
			} else if (
				!event.shiftKey &&
				document.activeElement === lastElement
			) {
				event.preventDefault();
				firstElement?.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
			trigger?.focus();
		};
	}, [isOpen]);

	const modal = isOpen ? (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) setIsOpen(false);
			}}
		>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				className="w-full max-w-4xl max-h-[calc(100dvh-2rem)] overflow-hidden rounded-2xl border border-beige-highlight/15 bg-bg-1 shadow-2xl shadow-black/50"
			>
				<div className="flex items-start justify-between gap-6 border-b border-beige-highlight/10 px-5 py-4 sm:px-6">
					<div>
						<p className="mb-1 font-mono text-xs tracking-wider text-beige-highlight">
							AVAILABLE TO CONNECT
						</p>
						<h2
							id={titleId}
							className="text-xl font-semibold text-text-primary sm:text-2xl"
						>
							Schedule a call
						</h2>
						<p
							id={descriptionId}
							className="mt-1 text-sm text-text-muted"
						>
							Choose a time that works for you.
						</p>
					</div>

					<button
						ref={closeButtonRef}
						type="button"
						onClick={() => setIsOpen(false)}
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-beige-highlight/10 text-text-muted transition-colors hover:bg-beige-highlight/10 hover:text-beige-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beige-highlight"
						aria-label="Close scheduling dialog"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18 18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<iframe
					src={APPOINTMENT_URL}
					title="Book an appointment with Sujan Shrestha"
					className="h-[calc(100dvh-10rem)] min-h-[300px] max-h-[600px] w-full bg-white sm:h-[600px] sm:min-h-[500px]"
					frameBorder="0"
				/>
			</div>
		</div>
	) : null;

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setIsOpen(true)}
				className="group inline-flex items-center gap-2 rounded-xl border border-beige-highlight/15 bg-beige-highlight/5 px-6 py-3.5 font-semibold text-beige-highlight transition-all duration-300 hover:bg-beige-highlight/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beige-highlight"
			>
				<span>Schedule a Call</span>
				<svg
					className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
					/>
				</svg>
			</button>

			{typeof document !== "undefined" && modal
				? createPortal(modal, document.body)
				: null}
		</>
	);
}
