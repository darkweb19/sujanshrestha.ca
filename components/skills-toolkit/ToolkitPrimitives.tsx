"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./toolkit.module.css";

export function Button({ variant = "secondary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" }) {
	return <button type="button" className={`${styles.button} ${styles[variant]} ${className}`} {...props} onClick={props.onClick} />;
}

export function Feedback({ children, error = false }: { children: ReactNode; error?: boolean }) {
	return <div role={error ? "alert" : "status"} className={`${styles.feedback} ${error ? styles.error : ""}`}>{children}</div>;
}

export function Dialog({ title, children, onClose, wide = false, closeDisabled = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean; closeDisabled?: boolean }) {
	const ref = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const previous = document.activeElement as HTMLElement | null;
		const dialog = ref.current;
		dialog?.showModal();
		return () => { dialog?.close(); previous?.focus(); };
	}, []);
	return <dialog ref={ref} className={`${styles.dialog} ${wide ? styles.dialogWide : ""}`} aria-labelledby="toolkit-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
		<div className={styles.dialogHeading}><h2 id="toolkit-dialog-title">{title}</h2><Button variant="quiet" onClick={onClose} disabled={closeDisabled} aria-label="Close dialog">Close <span aria-hidden="true">×</span></Button></div>
		{children}
	</dialog>;
}

export function ExternalArrow() {
	return <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
