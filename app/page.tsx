import dynamic from "next/dynamic";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Hero from "@/components/Hero";

// Dynamically import below-the-fold components to improve initial load
const About = dynamic(() => import("@/components/About"), {
	loading: () => <section className="min-h-[50vh]" />,
});
const Experience = dynamic(() => import("@/components/Experience"), {
	loading: () => <section className="min-h-[50vh]" />,
});
const Projects = dynamic(() => import("@/components/Projects"), {
	loading: () => <section className="min-h-[50vh]" />,
});
const Academics = dynamic(() => import("@/components/Academics"), {
	loading: () => <section className="min-h-[50vh]" />,
});
const Contact = dynamic(() => import("@/components/Contact"), {
	loading: () => <section className="min-h-[50vh]" />,
});

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
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			{/* Main Content */}
			<Navbar />
			<main>
				<Hero />
				<About />
				<Experience />
				<Projects />
				<Academics />
				<Contact />
			</main>
			<Footer />
		</>
	);
}
