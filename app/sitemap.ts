import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";

const BLOGS_DIR = path.join(process.cwd(), "app", "blogs");

function getBlogSlugs(): string[] {
	const entries = fs.readdirSync(BLOGS_DIR, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isDirectory())
		.filter((entry) =>
			fs.existsSync(path.join(BLOGS_DIR, entry.name, "blog.md")),
		)
		.map((entry) => entry.name);
}

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://sujanshrestha.ca";

	const blogEntries: MetadataRoute.Sitemap = getBlogSlugs().map((slug) => ({
		url: `${baseUrl}/blogs/${slug}`,
		lastModified: new Date(),
		changeFrequency: "monthly",
		priority: 0.6,
	}));

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${baseUrl}/blogs`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		...blogEntries,
	];
}
