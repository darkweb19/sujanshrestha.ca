/** Display-only taxonomy: source Markdown and stored package metadata stay intact. */
const labels: Record<string, string> = {
	marketing: "Marketing", "c-level": "Leadership", design: "Design",
	engineering: "Engineering", "engineering-team": "Engineering",
	"Engineering / Code Quality": "Engineering", finance: "Finance",
	"business-growth": "Business & product",
};
const inferred: [string, RegExp][] = [
	["Design", /(?:^design|^ui-|^ux-|^epic-design|a11y|brand-guidelines|apple-hig|screenshot|landing-page|^landing$)/],
	["Security", /(?:security|secops|secrets|threat|red-team|incident-response|ciso)/],
	["Data & AI", /(?:data-|database|sql-|computer-vision|scientist|ml-engineer|rag-|llm-|prompt-|ai-|agent-|context-engine|self-eval|self-improving|claude-coach|autoresearch)/],
	["Infrastructure", /(?:cloud|aws-|azure-|gcp-|devops|docker|kubernetes|terraform|ci-cd|observability|slo-|chaos-|incident-|runbook|ms365)/],
	["Marketing", /(?:marketing|linkedin|seo|aeo|copywriting|copy-editing|content-|social-|youtube|x-twitter|campaign|analytics-tracking|ad-creative|paid-ads|email-|cold-email|launch-strategy|cro$|schema-markup|referral|churn)/],
	["Business & product", /(?:product-|business-|finance|financial-|sales-|revenue-|pricing-|customer-|market-|competitive-|competitor-|founder-|board-|company-|org-|culture-|strategic-|scenario-|decision-|change-management|contract-|interview-|intl-|ma-playbook|saas-|chief-|senior-pm|tc-tracker|deep-work)/],
	["Engineering", /(?:senior-|code|api-|test|git-|pr-|tdd|tech-|dependency-|monorepo|mcp-|migration-|env-|stripe-|feature-|spec-|focused-fix|ship-gate|karpathy|adversarial|grill-me|browser-automation)/],
];
export function skillCategory(slug: string, category: string): string {
	if (labels[category]) return labels[category];
	if (category && category !== "Imported") return category;
	return inferred.find(([, pattern]) => pattern.test(slug))?.[0] || "General";
}
