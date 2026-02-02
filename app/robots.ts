import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = "https://sujanshrestha.ca";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/private/"],
			},
			// AI Crawlers - Allowed by default (easy to flip later)
			{
				userAgent: "GPTBot",
				allow: "/",
			},
			{
				userAgent: "OAI-SearchBot",
				allow: "/",
			},
			{
				userAgent: "ChatGPT-User",
				allow: "/",
			},
			{
				userAgent: "Claude-Web",
				allow: "/",
			},
			{
				userAgent: "Googlebot-Extended",
				allow: "/",
			},
			{
				userAgent: "Google-Extended",
				allow: "/",
			},
			{
				userAgent: "CCBot",
				allow: "/",
			},
			{
				userAgent: "anthropic-ai",
				allow: "/",
			},
			{
				userAgent: "PerplexityBot",
				allow: "/",
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
