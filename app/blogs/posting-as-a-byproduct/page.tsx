import path from "path";
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
