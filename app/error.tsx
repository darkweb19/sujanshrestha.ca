"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
	return (
		<main
			tabIndex={-1}
			id="main-content"
			className="section-container portfolio-section"
		>
			<h1 className="section-title">Something didn&apos;t load.</h1>
			<p className="section-copy mt-6 mb-8">
				Please try again. Your saved skills remain in the library.
			</p>
			<div className="flex gap-4">
				<button type="button" className="action action-primary" onClick={reset}>
					Try again
				</button>
				<Link href="/" className="action">
					Back home
				</Link>
			</div>
		</main>
	);
}
