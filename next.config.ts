import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
	},
	async redirects() {
		return [
			{
				source: "/blog",
				destination: "/blogs",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
