import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
	title: "Blog",
	description:
		"Thoughts on technology, software development, and the journey of building things that matter.",
};

const blogPosts = [
	{
		title: "AI Impact in Tech: Perspectives and Predictions",
		date: "March 19, 2024",
		readTime: "8 min read",
		excerpt:
			"Exploring how artificial intelligence is reshaping the technology landscape and what it means for developers in the coming years.",
		slug: "ai-in-tech",
		tags: ["AI", "Technology", "Future"],
	},
];

export default function BlogPage() {
	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-bg-0">
				{/* Header */}
				<header className="pt-32 pb-16 relative overflow-hidden">
					{/* Background gradient */}
					<div className="absolute inset-0 bg-gradient-to-b from-beige-deep/5 to-transparent" />

					<div className="section-container relative z-10">
						<Link
							href="/"
							className="inline-flex items-center gap-2 text-text-muted hover:text-beige-highlight transition-colors mb-8"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							Back to Home
						</Link>

						<h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
							<span className="gradient-text">Blog</span>
						</h1>
						<p className="text-xl text-text-muted max-w-2xl">
							Thoughts on technology, software development, and
							the journey of building things that matter.
						</p>
					</div>
				</header>

				{/* Content */}
				<section className="pb-32">
					<div className="section-container">
						{/* Blog Posts */}
						<div className="space-y-6 mb-16">
							{blogPosts.map((post) => (
								<article
									key={post.slug}
									className="group glass rounded-2xl p-8 transition-all duration-300 hover:border-beige-deep/30"
								>
									<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
										<div className="flex items-center gap-4 text-sm text-text-dim font-mono">
											<span>{post.date}</span>
											<span>•</span>
											<span>{post.readTime}</span>
										</div>
										<div className="flex gap-2">
											{post.tags.map((tag) => (
												<span
													key={tag}
													className="text-xs px-3 py-1 rounded-full bg-beige-deep/10 text-beige-accent"
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									<h2 className="text-2xl font-semibold text-text-primary group-hover:text-beige-highlight transition-colors mb-4">
										{post.title}
									</h2>
									<p className="text-text-muted leading-relaxed mb-6">
										{post.excerpt}
									</p>

									<span className="inline-flex items-center gap-2 text-beige-accent group-hover:text-beige-highlight transition-colors">
										Read more
										<svg
											className="w-4 h-4 group-hover:translate-x-1 transition-transform"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 8l4 4m0 0l-4 4m4-4H3"
											/>
										</svg>
									</span>
								</article>
							))}
						</div>

						{/* Coming Soon Section */}
						<div className="text-center py-16 glass-beige rounded-2xl">
							<div className="text-6xl mb-6">☕</div>
							<h3 className="text-2xl font-semibold text-beige-highlight mb-4">
								More Content Brewing...
							</h3>
							<p className="text-text-muted max-w-md mx-auto mb-8">
								I&apos;m working on more articles about web
								development, cloud architecture, and lessons
								learned from building products.
							</p>
							<div className="flex flex-wrap justify-center gap-4">
								<div className="px-4 py-2 rounded-lg bg-bg-2/50 text-text-dim text-sm font-mono">
									Next.js Deep Dives
								</div>
								<div className="px-4 py-2 rounded-lg bg-bg-2/50 text-text-dim text-sm font-mono">
									AWS Lambda Tips
								</div>
								<div className="px-4 py-2 rounded-lg bg-bg-2/50 text-text-dim text-sm font-mono">
									DevOps Best Practices
								</div>
							</div>
						</div>

						{/* Newsletter Teaser */}
						<div className="mt-16 text-center">
							<p className="text-text-muted mb-4">
								Want to be notified when new posts are
								published?
							</p>
							<Link
								href="/#contact"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-beige-deep/20 text-beige-highlight hover:bg-beige-deep/30 transition-colors"
							>
								Get in Touch
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</Link>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
