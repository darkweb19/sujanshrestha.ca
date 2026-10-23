"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native top-layer dialog, shared by public scheduling and project exploration. */
export default function Modal({
	children,
	labelledBy,
	describedBy,
	className,
	onClose,
}: {
	children: ReactNode;
	labelledBy: string;
	describedBy?: string;
	className: string;
	onClose: () => void;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const previous =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		const dialog = ref.current;
		const overflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		dialog?.showModal();
		dialog
			?.querySelector<HTMLButtonElement>("[data-modal-close]")
			?.focus({ preventScroll: true });
		return () => {
			dialog?.close();
			document.body.style.overflow = overflow;
			if (previous?.isConnected) previous.focus({ preventScroll: true });
		};
	}, []);
	return (
		<dialog
			ref={ref}
			className={className}
			aria-labelledby={labelledBy}
			aria-describedby={describedBy}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => {
				if (event.target !== event.currentTarget) return;
				const bounds = event.currentTarget.getBoundingClientRect();
				if (
					event.clientX < bounds.left ||
					event.clientX > bounds.right ||
					event.clientY < bounds.top ||
					event.clientY > bounds.bottom
				)
					onClose();
			}}
		>
			{children}
		</dialog>
	);
}
