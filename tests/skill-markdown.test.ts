import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { renderSkillMarkdown } from "../lib/skills-toolkit/markdown";

test("skill reading view formats Markdown and omits frontmatter without changing source", () => {
	const source = '---\nname: example\ndescription: A skill\n---\n# Read me\n\n- **Review** first\n\n```ts\nconst safe = true;\n```\n\n| File | Role |\n| --- | --- |\n| SKILL.md | Entry |';
	const html = renderToStaticMarkup(renderSkillMarkdown(source));
	assert.match(html, /<h3>Read me<\/h3>/);
	assert.match(html, /<strong>Review<\/strong>/);
	assert.match(html, /<pre><code>const safe = true;/);
	assert.match(html, /<table>/);
	assert.doesNotMatch(html, /description: A skill/);
	assert.ok(source.startsWith('---\nname: example'));
});

test("untrusted Markdown cannot execute HTML, load images or create unsafe links", () => {
	const source = '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[unsafe](javascript:alert%281%29) [data](data:text/html,test) ![remote](https://tracker.example/pixel)\n\n[safe](https://example.com)';
	const html = renderToStaticMarkup(renderSkillMarkdown(source));
	assert.doesNotMatch(html, /<script|<img|onerror|javascript:|data:text/);
	assert.match(html, /\[Image: remote\]/);
	assert.match(html, /href="https:\/\/example.com\/" target="_blank" rel="noopener noreferrer"/);
});

test("source code stays escaped and relative supporting paths stay inert", () => {
	const html = renderToStaticMarkup(renderSkillMarkdown('`<iframe src=x>`\n\n[Guide](references/guide.md)'));
	assert.match(html, /&lt;iframe src=x&gt;/);
	assert.match(html, /<span>Guide<\/span>/);
	assert.doesNotMatch(html, /href="references/);
});
