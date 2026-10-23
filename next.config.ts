import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "X-Frame-Options", value: "DENY" },
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
	images: {
		formats: ["image/webp"],
		qualities: [50, 75],
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
