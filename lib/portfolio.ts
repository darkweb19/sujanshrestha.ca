// Exact career, project and education records preserved from the redesign baseline.

export const experiences = [
	{
		id: "exp-000",
		title: "Founding AI Engineer",
		type: "Permanent Full-time",
		company: "Atsresumie",
		location: "Toronto, ON",
		period: "Jan 2026 – Present",
		status: "ACTIVE",
		technologies: [
			"TypeScript",
			"Node.js",
			"React",
			"Docker",
			"GitHub Actions",
			"REST APIs",
		],
		highlights: [
			"Architected and built scalable REST APIs and microservices using Node.js and TypeScript, establishing foundation for platform growth",
			"Developed comprehensive component architecture and shared systems enabling cross-functional teams to build features independently",
			"Built full-stack features ensuring seamless integration between frontend React applications and backend services",
			"Implemented containerized services using Docker with CI/CD pipelines via GitHub Actions, improving deployment reliability and developer experience",
			"Designed automated generation pipeline transforming user inputs into structured outputs, optimizing performance for growing user base",
			"Led end-to-end development lifecycle from system design through deployment, collaborating closely with stakeholders to translate requirements into technical solutions",
		],
	},
	{
		id: "exp-001",
		title: "Backend Developer",
		type: "Part-time/Contract",
		company: "NextUnicorn",
		location: "Remote",
		period: "April 2025 – Oct 2025",
		status: "COMPLETED",
		technologies: [
			"TypeScript",
			"Node.js",
			"Next.js",
			"Docker",
			"Jest",
			"PostgreSQL",
			"Supabase",
		],
		highlights: [
			"Worked on backend microservice architecture with a focus on the Authentication Microservice",
			"Implemented secure user authentication flows and authorization protocols",
			"Wrote test cases for authentication microservice endpoints using Supertest",
			"Collaborated with the DevOps team to streamline deployment processes",
		],
	},
	{
		id: "exp-002",
		title: "Frontend Developer Intern",
		type: "Internship",
		company: "Dobaato",
		location: "Remote",
		period: "Jan 2025 – May 2025",
		status: "COMPLETED",
		technologies: [
			"TypeScript",
			"React.js",
			"Next.js",
			"Redux",
			"Docker",
			"Supabase",
			"PostgreSQL",
		],
		highlights: [
			"Built Dobaato's landing page and integrated a CMS for blogs and career section",
			"Saahitt Project: Integrated Django backend with Next.js frontend",
			"Collaborated with UI/UX team to align frontend with design requirements",
			"Assisted in SEO optimization and content structuring for organic reach",
		],
	},
	{
		id: "exp-003",
		title: "Open-Source Contributor",
		type: "Contributor",
		company: "KeepReact",
		location: "Remote",
		period: "Sept 2023 – Nov 2023",
		status: "COMPLETED",
		technologies: ["React", "TypeScript", "CSS", "Git"],
		highlights: [
			"Resolved UX issue by fixing avatar image group redirection behavior",
			"Contributed improvements to frontend UI for better usability",
		],
	},
];

export type PortfolioProject = {
	id: string;
	title: string;
	summary: string;
	description: string;
	tech: string[];
	url: string;
	source?: string;
	live?: string;
	embed?: string;
	image?: string;
	illustration?: "video" | "rust" | "outpost" | "draftforge";
	category: string;
	tone: "lilac" | "peach" | "mint" | "blue";
	featured: boolean;
};

export const projects: PortfolioProject[] = [
	{
		id: "atsresumie",
		title: "ATSResumie",
		summary: "A resume that speaks the job’s language.",
		category: "AI & resumes",
		tone: "lilac",
		live: "https://atsresumie.com",
		embed: "https://www.atsresumie.com/",
		image: "/images/projects/atsresumie.png",
		description:
			"AI-powered resume builder that analyzes job descriptions and optimizes resumes for ATS compatibility. Features real-time PDF generation and smart suggestions.",
		tech: ["Next.js", "TypeScript", "Supabase", "OpenAI", "AWS Lambda"],
		url: "https://atsresumie.com",
		featured: true,
	},
	{
		id: "framevault",
		title: "FrameVault",
		summary: "A studio for generating and keeping video stories.",
		description:
			"Self-hosted video workspace for generating single clips or five-scene, 30-second stories, storing media and job state, and reviewing manual YouTube uploads. Optional clipping imports public YouTube footage for transcript and candidate analysis; candidate editing/export and automatic publishing or scheduling are not implemented.",
		tech: [
			"Go",
			"JavaScript",
			"SQLite",
			"FFmpeg",
			"OpenRouter",
			"Modal",
			"Docker",
		],
		url: "https://video.sujanshrestha.ca",
		live: "https://video.sujanshrestha.ca",
		source: "https://github.com/darkweb19/video-automation",
		illustration: "video",
		category: "Video automation",
		tone: "peach",
		featured: false,
	},
	{
		id: "youtube-extractor",
		title: "YouTube Extractor",
		summary: "YouTube links to downloadable media, built in Rust.",
		description:
			"Asynchronous Rust service and browser UI for turning authorized YouTube links into downloadable media. Apify Actors acquire metadata and files; bounded Tokio jobs manage processing and local storage, while FFmpeg validates and converts outputs. Includes progress, cancellation, and authenticated file delivery.",
		tech: [
			"Rust",
			"Axum",
			"Tokio",
			"Reqwest",
			"Apify",
			"FFmpeg",
			"JavaScript",
			"Docker",
		],
		url: "https://github.com/darkweb19/youtube-extractor-rs",
		source: "https://github.com/darkweb19/youtube-extractor-rs",
		illustration: "rust",
		category: "Media tools · Rust",
		tone: "blue",
		featured: false,
	},
	{
		id: "outpost",
		title: "Outpost",
		summary: "Your own cloud workspace for coding agents.",
		category: "Developer infrastructure",
		tone: "mint",
		source: "https://github.com/useoutpost-dev/outpost",
		illustration: "outpost",
		description:
			"Self-hosted, browser-accessible cloud environment for running Claude Code in isolated Docker sandboxes. Spin up disposable containers, drive them from a real terminal in the browser, and compare configuration profiles side by side — credentials never leave your infrastructure.",
		tech: ["React", "Fastify", "Docker", "Drizzle ORM", "Fly.io"],
		url: "https://github.com/useoutpost-dev/outpost",
		featured: false,
	},
	{
		id: "draftforge",
		title: "DraftForge",
		summary: "From a rough idea to an agent-ready plan.",
		category: "Agent workflows",
		tone: "lilac",
		source: "https://github.com/darkweb19/draftforge",
		illustration: "draftforge",
		description:
			"Local-first CLI that turns a rough Markdown idea into an architecture interview, recorded decisions, a phased implementation plan, and an agent-ready scaffold. A lead model decides but never implements, cheaper worker models execute bounded task contracts, and a reviewer gates every step.",
		tech: ["Node.js", "CLI", "Anthropic API", "OpenAI API", "Codex CLI"],
		url: "https://github.com/darkweb19/draftforge",
		featured: false,
	},
	{
		id: "nevercomes",
		title: "NeverComes",
		summary: "All the fun of ordering. None of the delivery.",
		category: "Playful commerce",
		tone: "peach",
		live: "https://nevercomes.sujanshrestha.ca",
		embed: "https://nevercomes.sujanshrestha.ca",
		image: "/images/projects/nevercomes.png",
		description:
			"A deadpan parody shopping & food-delivery app. Browse products, add to cart, checkout, and track your courier on a live map — the order never arrives. All the dopamine of buying, none of the receipt.",
		tech: ["Next.js", "TypeScript", "Supabase", "MapLibre GL JS", "Zustand"],
		url: "https://nevercomes.sujanshrestha.ca",
		featured: false,
	},
];

export const education = [
	{
		level: "Diploma in Computer System Technician",
		institution: "Loyalist College, Toronto",
		description: "Currently pursuing diploma in Computer System Technician.",
		year: "2024 - Present",
		country: "canada",
		highlight: true,
	},
	{
		level: "Bachelor's Degree in CSIT",
		institution: "St Lawrence College, Kathmandu",
		description:
			"Studying Bachelor's Degree in Computer Science and Information Technology at Tribhuwan University.",
		year: "2020 - Present",
		country: "nepal",
		highlight: false,
	},
	{
		level: "MERN Stack Bootcamp",
		institution: "Deerwalk Institute of Technology",
		description: "Completed intensive bootcamp course in the MERN stack.",
		year: "2023",
		country: "nepal",
		highlight: false,
	},
	{
		level: "Intermediate in Science (+2 Science)",
		institution: "Himalayan Pyramid Higher Secondary School, Birgunj",
		description:
			"Passed Higher Secondary Education Examination held by NEB, Nepal with GPA 3.19.",
		year: "2018 - 2020",
		country: "nepal",
		highlight: false,
	},
	{
		level: "Secondary Education (SEE)",
		institution: "Little Flower Secondary School, Birgunj",
		description:
			"Passed Secondary Education Examination held by Ministry of Education, Nepal with GPA 3.35.",
		year: "2018",
		country: "nepal",
		highlight: false,
	},
];
