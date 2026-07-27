import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import matter from "gray-matter";

export const metadata: Metadata = {
	title: "Blog",
	description:
		"Thoughts on technology, software development, and the journey of building things that matter.",
};

interface PostSummary {
	slug: string;
	title: string;
	description: string;
	date: string;
}

const BLOGS_DIR = path.join(process.cwd(), "app", "blogs");

/**
 * Scans app/blogs/* at build time for folders containing a blog.md, reads each
 * frontmatter, and returns the summaries sorted newest-first.
 */
function getPosts(): PostSummary[] {
	const entries = fs.readdirSync(BLOGS_DIR, { withFileTypes: true });

	const posts = entries
		.filter((entry) => entry.isDirectory())
		.map((entry): PostSummary | null => {
			const mdPath = path.join(BLOGS_DIR, entry.name, "blog.md");
			if (!fs.existsSync(mdPath)) return null;
			const { data } = matter(fs.readFileSync(mdPath, "utf8"));
			return {
				slug: entry.name,
				title: data.title ?? entry.name,
				description: data.description ?? "",
				date: data.date ? String(data.date) : "",
			};
		})
		.filter((post): post is PostSummary => post !== null);

	posts.sort((a, b) => {
		const ta = new Date(a.date).getTime();
		const tb = new Date(b.date).getTime();
		if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
		if (Number.isNaN(ta)) return 1;
		if (Number.isNaN(tb)) return -1;
		return tb - ta;
	});

	return posts;
}

export default function BlogsIndex() {
	const posts = getPosts();

	return (
		<main className="min-h-screen bg-bg-0">
			<header className="pt-32 pb-16 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-beige-highlight/50 to-transparent" />
				<div className="section-container relative z-10">
					<h1 className="text-4xl md:text-6xl font-bold mb-6">
						<span className="gradient-text">Blog</span>
					</h1>
					<p className="text-xl text-text-muted max-w-2xl">
						Thoughts on technology, software development, and the
						journey of building things that matter.
					</p>
				</div>
			</header>

			<section className="pb-32">
				<div className="section-container space-y-6">
					{posts.length === 0 && (
						<p className="text-text-muted">No posts yet.</p>
					)}
					{posts.map((post) => (
						<Link
							key={post.slug}
							href={`/blogs/${post.slug}`}
							className="group block border border-black/8 bg-bg-1 shadow-card rounded-2xl p-8 transition-all duration-300 hover:border-coffee/30 hover:shadow-card-hover"
						>
							{post.date && (
								<div className="text-sm text-text-dim font-mono mb-3">
									{post.date}
								</div>
							)}
							<h2 className="text-2xl font-semibold text-text-primary group-hover:text-coffee transition-colors mb-3">
								{post.title}
							</h2>
							<p className="text-text-muted leading-relaxed">
								{post.description}
							</p>
						</Link>
					))}
				</div>
			</section>
		</main>
	);
}
