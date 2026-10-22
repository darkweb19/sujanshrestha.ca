import Link from "next/link";
import { getPosts } from "@/lib/posts";
export default function Writing() {
	return (
		<section id="writing" className="portfolio-section section-container">
			<header className="section-heading">
				<h2 className="section-kicker">Writing</h2>
				<p className="section-title">
					Notes from
					<br />
					building things.
				</p>
			</header>
			{getPosts().map((post) => (
				<Link
					href={`/blogs/${post.slug}`}
					key={post.slug}
					className="writing-row"
				>
					<time className="writing-date">{post.date}</time>
					<div>
						<h3>{post.title}</h3>
						<p>{post.description}</p>
					</div>
				</Link>
			))}
			<div className="mt-8">
				<Link href="/blogs" className="action">
					All writing
				</Link>
			</div>
		</section>
	);
}
