import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/posts";
export const metadata: Metadata = {
	title: "Blog",
	description:
		"Thoughts on technology, software development, and the journey of building things that matter.",
	alternates: { canonical: "/blogs" },
	twitter: {
		card: "summary_large_image",
		title: "Writing by Sujan Shrestha",
		description:
			"Thoughts on technology, software development, and the journey of building things that matter.",
	},
	openGraph: {
		url: "/blogs",
		title: "Writing by Sujan Shrestha",
		description:
			"Notes on technology, software development, and building things that matter.",
	},
};
export default function BlogsIndex() {
	const posts = getPosts();
	return (
		<main tabIndex={-1} id="main-content" className="section-container pb-24">
			<header className="page-intro">
				<h1>Writing.</h1>
				<p>
					Thoughts on technology, software development, and the journey of
					building things that matter.
				</p>
			</header>
			<section aria-label="Published articles">
				{posts.length === 0 && <p>No posts yet.</p>}
				{posts.map((post) => (
					<Link
						href={`/blogs/${post.slug}`}
						className="writing-row"
						key={post.slug}
					>
						<time className="writing-date">{post.date}</time>
						<div>
							<h2 className="text-2xl font-medium tracking-tight">
								{post.title}
							</h2>
							<p>{post.description}</p>
						</div>
					</Link>
				))}
			</section>
		</main>
	);
}
