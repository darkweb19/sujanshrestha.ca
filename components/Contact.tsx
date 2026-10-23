"use client";
import { useEffect, useRef, useState } from "react";
import Arrow from "./common/Arrow";
export default function Contact() {
	const [message, setMessage] = useState("");
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current);
		},
		[],
	);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText("hi@sujanshrestha.ca");
			setMessage("Email copied");
		} catch {
			setMessage(
				"Copy unavailable. Select the email above or use the email link.",
			);
		}
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => setMessage(""), 5000);
	};
	return (
		<section id="contact" className="contact-section">
			<div className="section-container">
				<header className="section-heading">
					<h2 className="section-kicker">Contact</h2>
					<p className="section-title">Let&apos;s build something.</p>
				</header>
				<div className="about-grid">
					<div />
					<div>
						<p className="contact-intro">
							A project, a collaboration, or just a hello.
						</p>
						<a href="mailto:hi@sujanshrestha.ca" className="contact-email">
							hi@sujanshrestha.ca
						</a>
						<div className="contact-links">
							<button type="button" onClick={() => void copy()}>
								Copy email
							</button>
							<a
								href="https://github.com/darkweb19"
								target="_blank"
								rel="noopener noreferrer"
							>
								GitHub <Arrow size={14} />
							</a>
							<a
								href="https://linkedin.com/in/sujansthadev"
								target="_blank"
								rel="noopener noreferrer"
							>
								LinkedIn <Arrow size={14} />
							</a>
							<a href="/blogs">Blog</a>
						</div>
						<p role="status" className="min-h-6 text-sm text-text-muted">
							{message}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
