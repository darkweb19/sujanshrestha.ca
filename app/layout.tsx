import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MotionProvider from "@/components/common/MotionProvider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://sujanshrestha.ca"),
	title: {
		default: "Sujan Shrestha | Full-Stack Software Engineer",
		template: "%s | Sujan Shrestha",
	},
	description:
		"Full-Stack Software Engineer based in Toronto, passionate about creating beautiful products that empower people. Specializing in Next.js, TypeScript, React, AWS, and modern web technologies.",
	keywords: [
		"Sujan Shrestha",
		"Software Engineer",
		"Full-Stack Developer",
		"Next.js",
		"React",
		"TypeScript",
		"Toronto Developer",
		"Web Developer",
		"AWS",
		"Node.js",
	],
	authors: [{ name: "Sujan Shrestha", url: "https://sujanshrestha.ca" }],
	creator: "Sujan Shrestha",
	openGraph: {
		type: "website",
		locale: "en_CA",
		url: "https://sujanshrestha.ca",
		siteName: "Sujan Shrestha",
		title: "Sujan Shrestha | Full-Stack Software Engineer",
		description:
			"Full-Stack Software Engineer based in Toronto, passionate about creating beautiful products that empower people.",
	},
	twitter: {
		card: "summary_large_image",
		title: "Sujan Shrestha | Full-Stack Software Engineer",
		description:
			"Full-Stack Software Engineer based in Toronto, passionate about creating beautiful products that empower people.",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="scroll-smooth">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<MotionProvider>{children}</MotionProvider>
			</body>
		</html>
	);
}
