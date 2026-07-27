import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

export interface BlogFrontmatter {
	title: string;
	date: string;
	description: string;
	tags: string[];
}

export interface RenderedBlog {
	metadata: Metadata;
	frontmatter: BlogFrontmatter;
	Content: () => React.JSX.Element;
}

/**
 * Reads the `blog.md` that sits in `dir`, parses its frontmatter, converts the
 * markdown body to HTML (GFM + syntax-highlighted code blocks), and returns the
 * Next.js `metadata`, the parsed `frontmatter`, and a `Content` component that
 * renders the post.
 *
 * This runs at build time (each post is a static route), so reading from the
 * source directory is safe — no filesystem access happens at request time.
 */
export async function renderMarkdownPage(dir: string): Promise<RenderedBlog> {
	const raw = fs.readFileSync(path.join(dir, "blog.md"), "utf8");
	const { data, content } = matter(raw);

	const frontmatter: BlogFrontmatter = {
		title: data.title ?? "Untitled",
		date: data.date ? String(data.date) : "",
		description: data.description ?? "",
		tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
	};

	const processed = await remark()
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeHighlight)
		.use(rehypeStringify)
		.process(content);
	const html = String(processed);

	const metadata: Metadata = {
		title: frontmatter.title,
		description: frontmatter.description,
		keywords: frontmatter.tags,
		openGraph: {
			type: "article",
			title: frontmatter.title,
			description: frontmatter.description,
		},
		twitter: {
			card: "summary_large_image",
			title: frontmatter.title,
			description: frontmatter.description,
		},
	};

	function Content() {
		return (
			<main className="min-h-screen bg-bg-0 pt-32 pb-24">
				<div className="section-container">
					<header className="mb-10">
						<h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
							{frontmatter.title}
						</h1>
						<div className="flex flex-wrap items-center gap-4 text-sm text-text-dim font-mono">
							{frontmatter.date && <span>{frontmatter.date}</span>}
							{frontmatter.tags.map((tag) => (
								<span
									key={tag}
									className="px-3 py-1 rounded-full bg-beige-highlight/70 text-espresso"
								>
									{tag}
								</span>
							))}
						</div>
					</header>
					<article
						className="prose max-w-none"
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</div>
			</main>
		);
	}

	return { metadata, frontmatter, Content };
}
