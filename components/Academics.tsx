"use client";

import { m, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Education data with country info for the transition story
const education = [
	{
		level: "Diploma in Computer System Technician",
		institution: "Loyalist College, Toronto",
		description:
			"Currently pursuing diploma in Computer System Technician.",
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

export default function Academics() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const timelineRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: timelineRef,
		offset: ["start center", "end center"],
	});

	const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

	// Find the transition point (first Canada entry)
	const transitionIndex = education.findIndex((e) => e.country === "canada");

	return (
		<section ref={ref} id="academics" className="py-32 relative">
			<div className="section-container">
				{/* Header */}
				<m.header
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.5 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-coffee tracking-wider mb-4">
						04 — Academics
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
						Education <span className="gradient-text">Journey</span>
					</h3>
					<p className="text-text-muted max-w-2xl">
						From the foothills of the Himalayas to the shores of
						Lake Ontario — my educational journey across continents.
					</p>
				</m.header>

				{/* Timeline */}
				<div ref={timelineRef} className="relative max-w-3xl mx-auto">
					{/* Timeline line - background */}
					<div
						className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-bg-2 -translate-x-1/2"
						aria-hidden="true"
					/>

					{/* Timeline line - animated fill */}
					<m.div
						style={{ height: lineHeight }}
						className="absolute left-4 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-espresso via-coffee to-beige-deep -translate-x-1/2 origin-top"
						aria-hidden="true"
					/>

					{/* Timeline items */}
					<ol className="space-y-12 list-none">
						{education.map((item, index) => (
							<TimelineItem
								key={item.level}
								item={item}
								index={index}
								isInView={isInView}
								isTransition={index === transitionIndex}
							/>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}

interface EducationItem {
	level: string;
	institution: string;
	description: string;
	year: string;
	country: string;
	highlight: boolean;
}

function TimelineItem({
	item,
	index,
	isInView,
	isTransition,
}: {
	item: EducationItem;
	index: number;
	isInView: boolean;
	isTransition: boolean;
}) {
	const isEven = index % 2 === 0;

	return (
		<m.li
			initial={{ opacity: 0, x: isEven ? -30 : 30 }}
			animate={isInView ? { opacity: 1, x: 0 } : {}}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			className={`relative flex flex-col md:flex-row items-start ${
				isEven ? "md:flex-row-reverse" : ""
			}`}
		>
			{/* Node */}
			<div
				className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10"
				aria-hidden="true"
			>
				<div className="relative">
					{/* Transition marker */}
					{isTransition ? (
						<div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee to-espresso flex items-center justify-center">
							<span className="text-[10px] font-mono text-bg-1 font-bold">
								CA
							</span>
						</div>
					) : (
						<div
							className={`w-4 h-4 rounded-full ${
								item.highlight
									? "bg-coffee"
									: item.country === "canada"
										? "bg-gradient-to-r from-coffee to-mocha"
										: "bg-gradient-to-r from-primary-start to-primary-end"
							}`}
						/>
					)}
				</div>
			</div>

			{/* Content */}
			<article
				className={`w-full md:w-[calc(50%-2rem)] ${
					isEven
						? "md:pr-8 md:text-right pl-12 md:pl-0"
						: "md:pl-8 pl-12"
				}`}
			>
				<div
					className={`glass shadow-card rounded-xl p-6 ${
						item.highlight ? "ring-1 ring-coffee/30" : ""
					} ${isTransition ? "ring-1 ring-coffee/30" : ""}`}
				>
					{/* Country label & year */}
					<div
						className={`flex items-center gap-2 mb-2 ${isEven ? "md:justify-end" : ""}`}
					>
						<span
							className="text-[10px] font-mono text-text-dim border border-black/12 rounded px-1.5 py-0.5"
							aria-label={item.country}
						>
							{item.country === "canada" ? "CA" : "NP"}
						</span>
						<time
							className={`text-xs font-mono ${
								item.highlight ? "text-coffee" : "text-mocha"
							}`}
						>
							{item.year}
						</time>
					</div>

					<h4
						className={`text-lg font-semibold mb-1 ${
							item.highlight ? "text-coffee" : "text-text-primary"
						}`}
					>
						{item.level}
					</h4>
					<p className="text-text-muted text-sm mb-2">
						{item.institution}
					</p>
					<p className="text-text-dim text-sm">{item.description}</p>
				</div>
			</article>
		</m.li>
	);
}
