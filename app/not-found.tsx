import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
export default function NotFound() {
	return (
		<>
			<Navbar />
			<main
				tabIndex={-1}
				id="main-content"
				className="section-container portfolio-section min-h-[60vh]"
			>
				<p className="section-kicker mb-6">404</p>
				<h1 className="section-title">This page isn&apos;t here.</h1>
				<p className="section-copy mt-6 mb-8">
					The link may have changed. Explore my work or read the latest
					articles.
				</p>
				<div className="flex gap-4">
					<Link href="/" className="action action-primary">
						Back home
					</Link>
					<Link href="/blogs" className="action">
						Read the blog
					</Link>
				</div>
			</main>
			<Footer />
		</>
	);
}
