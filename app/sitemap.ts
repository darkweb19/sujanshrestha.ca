import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
export default function sitemap(): MetadataRoute.Sitemap {
	const base = "https://sujanshrestha.ca";
	// No fabricated modification dates: article dates remain their published dates.
	return [
		{ url: base, changeFrequency: "monthly", priority: 1 },
		{ url: `${base}/blogs`, changeFrequency: "weekly", priority: 0.8 },
		{ url: `${base}/lab/codex`, changeFrequency: "monthly", priority: 0.7 },
		...getPosts().map((post) => ({
			url: `${base}/blogs/${post.slug}`,
			changeFrequency: "monthly" as const,
			priority: 0.6,
		})),
	];
}
