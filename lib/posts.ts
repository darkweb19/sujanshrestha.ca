import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
export function getPosts() {
	const root = path.join(process.cwd(), "app", "blogs");
	return fs
		.readdirSync(root, { withFileTypes: true })
		.filter(
			(entry) =>
				entry.isDirectory() &&
				fs.existsSync(path.join(root, entry.name, "blog.md")),
		)
		.map((entry) => {
			const { data } = matter(
				fs.readFileSync(path.join(root, entry.name, "blog.md"), "utf8"),
			);
			return {
				slug: entry.name,
				title: String(data.title ?? entry.name),
				description: String(data.description ?? ""),
				date: String(data.date ?? ""),
				tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
			};
		})
		.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}
