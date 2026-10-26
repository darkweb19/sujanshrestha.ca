type LinkedSkill = { id: string; slug: string };

/** Plain slugs name managed skills; uploaded skills retain their explicit namespace. */
export function rawSkillId(segment: string): string | null {
	const match = /^(?:(upstream|user):)?([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(segment);
	if (!match || match[2].length > 64) return null;
	return `${match[1] || "upstream"}:${match[2]}`;
}

export function rawSkillPath(skill: LinkedSkill): string {
	if (rawSkillId(skill.id) !== skill.id || !skill.id.endsWith(`:${skill.slug}`)) throw new Error("Invalid skill link.");
	const segment = skill.id.startsWith("user:") ? skill.id : skill.slug;
	return `/lab/skills/${encodeURIComponent(segment)}/skills.md`;
}

export function rawSkillUrl(skill: LinkedSkill, origin = "https://sujanshrestha.ca"): string {
	return new URL(rawSkillPath(skill), origin).href;
}
