import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
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
	const html = String(processed).replace(
		/<pre>/g,
		'<pre tabindex="0" aria-label="Code sample, scroll horizontally when needed">',
	);

	const slug = path.basename(dir);
	const canonical = `https://sujanshrestha.ca/blogs/${slug}`;
	const metadata: Metadata = {
		alternates: { canonical },
		title: frontmatter.title,
		description: frontmatter.description,
		keywords: frontmatter.tags,
		openGraph: {
			type: "article",
			url: canonical,
			publishedTime: frontmatter.date || undefined,
			authors: ["Sujan Shrestha"],
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
		const schema = {
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: frontmatter.title,
			description: frontmatter.description,
			datePublished: frontmatter.date || undefined,
			url: canonical,
			mainEntityOfPage: canonical,
			image: "https://sujanshrestha.ca/opengraph-image",
			author: {
				"@type": "Person",
				name: "Sujan Shrestha",
				url: "https://sujanshrestha.ca",
			},
		};
		return (
			<main tabIndex={-1} id="main-content" className="article-layout">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(schema).replace(/</g, "\\u003c"),
					}}
				/>
				<Link className="article-back" href="/blogs">
					← All writing
				</Link>
				<header>
					<h1>{frontmatter.title}</h1>
					<div className="article-meta">
						{frontmatter.date && <time>{frontmatter.date}</time>}
						{frontmatter.tags.map((tag) => (
							<span key={tag}>{tag}</span>
						))}
					</div>
				</header>
				<article
					className="prose max-w-none"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</main>
		);
	}

	return { metadata, frontmatter, Content };
}
