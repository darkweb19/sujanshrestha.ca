"use client";
import { useEffect, useRef, useState } from "react";
import Arrow from "./common/Arrow";
export default function Contact() {
	const [message, setMessage] = useState("");
	const [copying, setCopying] = useState(false);
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current);
		},
		[],
	);
	const copy = async () => {
		if (copying) return;
		setCopying(true);
		if (timer.current) clearTimeout(timer.current);
		try {
			await navigator.clipboard.writeText("hi@sujanshrestha.ca");
			setCopied(true);
			setMessage("Email copied");
			timer.current = setTimeout(() => { setMessage(""); setCopied(false); }, 5000);
		} catch {
			setCopied(false);
			setMessage("Copy unavailable. Use the email link above.");
		} finally {
			setCopying(false);
		}
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
							<button type="button" className="copy-email" disabled={copying} aria-busy={copying} onClick={() => void copy()}>
								{copying ? "Copying…" : copied ? "Copied" : "Copy email"}
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
						<p role="status" className="contact-feedback">
							{message}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
