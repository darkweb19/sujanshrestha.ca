#!/usr/bin/env node
// Scaffold a new blog post.
// Usage: node scripts/new-blog.mjs my-slug "My Title"

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const [, , slug, ...titleParts] = process.argv;

if (!slug) {
	console.error('Usage: node scripts/new-blog.mjs <slug> "<title>"');
	process.exit(1);
}

const title = titleParts.join(" ") || slug;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "app", "blogs", slug);

if (fs.existsSync(dir)) {
	console.error(`Post already exists: app/blogs/${slug}`);
	process.exit(1);
}

// Identical boilerplate that goes in every post folder, unchanged.
const pageTsx = `import path from "path";
import { fileURLToPath } from "url";
import { renderMarkdownPage } from "@/lib/blog";

const dir = path.dirname(fileURLToPath(import.meta.url));

export async function generateMetadata() {
	return (await renderMarkdownPage(dir)).metadata;
}

export default async function Page() {
	const { Content } = await renderMarkdownPage(dir);
	return <Content />;
}
`;

const today = new Date().toISOString().slice(0, 10);
const blogMd = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${today}"
description: ""
tags: []
---

`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "page.tsx"), pageTsx);
fs.writeFileSync(path.join(dir, "blog.md"), blogMd);

console.log(`Created app/blogs/${slug}/`);
console.log(`  - page.tsx (boilerplate)`);
console.log(`  - blog.md  (fill in description, tags, and body)`);
console.log(`\nEdit: app/blogs/${slug}/blog.md`);
console.log(`View: /blogs/${slug}`);
