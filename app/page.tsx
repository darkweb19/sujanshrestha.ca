import type { Metadata } from "next";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Hero from "@/components/Hero";
import SmoothScroll from "@/components/home/SmoothScroll";

import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Academics from "@/components/Academics";
import Contact from "@/components/Contact";
import Writing from "@/components/Writing";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// JSON-LD Structured Data for SEO
const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Sujan Shrestha",
	jobTitle: "Full-Stack Software Engineer",
	url: "https://sujanshrestha.ca",
	image: "https://sujanshrestha.ca/images/sujan.jpg",
	sameAs: [
		"https://github.com/darkweb19",
		"https://linkedin.com/in/sujansthadev",
	],
	address: {
		"@type": "PostalAddress",
		addressLocality: "Toronto",
		addressCountry: "CA",
	},
	alumniOf: [
		{
			"@type": "EducationalOrganization",
			name: "Loyalist College",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Toronto",
				addressCountry: "CA",
			},
		},
		{
			"@type": "EducationalOrganization",
			name: "Tribhuwan University - St Lawrence College",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Kathmandu",
				addressCountry: "NP",
			},
		},
		{
			"@type": "EducationalOrganization",
			name: "Deerwalk Institute of Technology",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Kathmandu",
				addressCountry: "NP",
			},
		},
	],
	knowsAbout: [
		"Next.js",
		"TypeScript",
		"React",
		"Node.js",
		"AWS",
		"Docker",
		"PostgreSQL",
		"MongoDB",
		"GraphQL",
	],
	description:
		"Full-Stack Software Engineer based in Toronto, passionate about creating beautiful products that empower people. Specializing in Next.js, TypeScript, React, AWS, and modern web technologies.",
};

export default function Home() {
	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": [
							jsonLd,
							{
								"@type": "WebSite",
								name: "Sujan Shrestha",
								url: "https://sujanshrestha.ca",
							},
						],
					}),
				}}
			/>

			{/* Main Content */}
			<SmoothScroll />
			<Navbar />
			<main tabIndex={-1} id="main-content">
				<Hero />
				<About />
				<Projects />
				<Experience />
				<Academics />
				<Writing />
				<Contact />
			</main>
			<Footer />
		</>
	);
}
