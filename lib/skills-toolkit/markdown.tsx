import { createElement, type ReactNode } from "react";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

type Node = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: Node[];
};
const processor = remark().use(remarkGfm).use(remarkRehype);
const allowed = new Set([
	"p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
	"strong", "em", "del", "blockquote", "pre", "code", "a", "hr", "br",
	"table", "thead", "tbody", "tr", "th", "td",
]);

function safeHref(value: unknown): string | undefined {
	if (typeof value !== "string") return;
	if (value.startsWith("#")) return value;
	try {
		const url = new URL(value);
		if (["https:", "http:", "mailto:"].includes(url.protocol) && !url.username && !url.password)
			return url.href;
	} catch { /* Relative paths remain readable; the package file picker owns navigation. */ }
}

/** React owns escaping. Raw HTML, images, handlers and arbitrary AST properties never render. */
export function renderSkillMarkdown(source: string): ReactNode {
	const body = source.replace(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
	const tree = processor.runSync(processor.parse(body)) as Node;
	function render(node: Node, key: number): ReactNode {
		if (node.type === "text") return node.value;
		if (node.type === "root") return node.children?.map(render);
		if (node.type !== "element" || !node.tagName) return null;
		if (node.tagName === "img") return node.properties?.alt ? `[Image: ${String(node.properties.alt)}]` : null;
		// HAST includes formatting whitespace that is invalid directly inside table rows.
		const children = node.children
			?.filter((child) => !(["table", "thead", "tbody", "tr"].includes(node.tagName!) && child.type === "text" && !child.value?.trim()))
			.map(render);
		if (!allowed.has(node.tagName)) return children;
		const props: Record<string, unknown> = { key };
		if (node.tagName === "a") {
			const href = safeHref(node.properties?.href);
			if (!href) return createElement("span", props, children);
			props.href = href;
			if (!href.startsWith("#")) {
				props.target = "_blank";
				props.rel = "noopener noreferrer";
			}
		}
		if (node.tagName === "ol" && typeof node.properties?.start === "number") props.start = node.properties.start;
		// The dialog owns h2; document headings start at h3 inside its content region.
		const tag = /^h[1-6]$/.test(node.tagName) ? `h${Math.min(6, Number(node.tagName[1]) + 2)}` : node.tagName;
		return tag === "hr" || tag === "br" ? createElement(tag, props) : createElement(tag, props, children);
	}
	return render(tree, 0);
}
