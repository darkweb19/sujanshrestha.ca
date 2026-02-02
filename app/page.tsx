import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Academics from "@/components/Academics";
import Contact from "@/components/Contact";

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
