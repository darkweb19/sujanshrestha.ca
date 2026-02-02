"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const education = [
	{
		level: "Diploma in Computer System Technician",
		institution: "Loyalist College, Toronto",
		description:
			"Currently pursuing diploma in Computer System Technician.",
		year: "2024 - Present",
		highlight: true,
	},
	{
		level: "Bachelor's Degree in CSIT",
		institution: "St Lawrence College, Kathmandu",
		description:
			"Studying Bachelor's Degree in Computer Science and Information Technology at Tribhuwan University.",
		year: "2020 - Present",
		highlight: false,
	},
	{
		level: "MERN Stack Bootcamp",
		institution: "Deerwalk Institute of Technology",
		description: "Completed intensive bootcamp course in the MERN stack.",
		year: "2023",
		highlight: false,
	},
	{
		level: "Intermediate in Science (+2 Science)",
		institution: "Himalayan Pyramid Higher Secondary School, Birgunj",
		description:
			"Passed Higher Secondary Education Examination held by NEB, Nepal with GPA 3.19.",
		year: "2018 - 2020",
		highlight: false,
	},
	{
		level: "Secondary Education (SEE)",
		institution: "Little Flower Secondary School, Birgunj",
		description:
			"Passed Secondary Education Examination held by Ministry of Education, Nepal with GPA 3.35.",
		year: "2018",
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

	return (
		<section ref={ref} id="academics" className="py-32 relative">
			<div className="section-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="mb-16"
				>
					<h2 className="text-sm font-mono text-beige-highlight tracking-wider mb-4">
						/academics
					</h2>
					<h3 className="text-4xl md:text-5xl font-bold text-text-primary">
						Education <span className="gradient-text">Journey</span>
					</h3>
				</motion.div>

				{/* Timeline */}
				<div ref={timelineRef} className="relative max-w-3xl mx-auto">
					{/* Timeline line - background */}
					<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-bg-2 -translate-x-1/2" />

					{/* Timeline line - animated fill */}
					<motion.div
						style={{ height: lineHeight }}
						className="absolute left-4 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-primary-start via-primary-end to-beige-highlight -translate-x-1/2 origin-top"
					/>

					{/* Timeline items */}
					<div className="space-y-12">
						{education.map((item, index) => (
							<TimelineItem
								key={item.level}
								item={item}
								index={index}
								isInView={isInView}
							/>
						))}
					</div>
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
	highlight: boolean;
}

function TimelineItem({
	item,
	index,
	isInView,
}: {
	item: EducationItem;
	index: number;
	isInView: boolean;
}) {
	const isEven = index % 2 === 0;

	return (
		<motion.div
			initial={{ opacity: 0, x: isEven ? -30 : 30 }}
			animate={isInView ? { opacity: 1, x: 0 } : {}}
			transition={{ duration: 0.6, delay: index * 0.15 }}
			className={`relative flex flex-col md:flex-row items-start ${
				isEven ? "md:flex-row-reverse" : ""
			}`}
		>
			{/* Node */}
			<div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
				<motion.div
					initial={{ scale: 0 }}
					animate={isInView ? { scale: 1 } : {}}
					transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
					className="relative"
				>
					{/* Pulse ring */}
					{item.highlight && (
						<motion.div
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.5, 0, 0.5],
							}}
							transition={{ duration: 2, repeat: Infinity }}
							className="absolute inset-0 rounded-full bg-beige-highlight"
						/>
					)}
					<div
						className={`w-4 h-4 rounded-full ${
							item.highlight
								? "bg-beige-highlight glow-beige"
								: "bg-gradient-to-r from-primary-start to-primary-end"
						}`}
					/>
				</motion.div>
			</div>

			{/* Content */}
			<div
				className={`w-full md:w-[calc(50%-2rem)] ${
					isEven
						? "md:pr-8 md:text-right pl-12 md:pl-0"
						: "md:pl-8 pl-12"
				}`}
			>
				<motion.div
					whileHover={{ scale: 1.02 }}
					className={`glass rounded-xl p-6 ${
						item.highlight ? "glass-beige glow-beige" : ""
					}`}
				>
					<span
						className={`text-xs font-mono ${
							item.highlight
								? "text-beige-highlight"
								: "text-primary-start"
						} mb-2 block`}
					>
						{item.year}
					</span>
					<h4
						className={`text-lg font-semibold mb-1 ${
							item.highlight
								? "text-beige-highlight"
								: "text-text-primary"
						}`}
					>
						{item.level}
					</h4>
					<p className="text-beige-accent text-sm mb-2">
						{item.institution}
					</p>
					<p className="text-text-dim text-sm">{item.description}</p>
				</motion.div>
			</div>
		</motion.div>
	);
}
