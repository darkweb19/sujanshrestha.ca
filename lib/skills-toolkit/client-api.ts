import type { SkillPackage } from "./types";

export type CatalogSkill = Omit<SkillPackage, "files"> & {
	fileCount: number;
	managed: boolean;
	revision: number;
};
export interface CatalogPage {
	skills: CatalogSkill[];
	total: number;
	page: number;
	pageSize: number;
	categories: string[];
}
export interface OwnerSession {
	authenticated: boolean;
	configured: boolean;
	csrfToken?: string;
}

export async function labRequest<T>(
	path: string,
	options: RequestInit = {},
	csrfToken?: string,
): Promise<T> {
	const response = await fetch(path, {
		...options,
		credentials: "same-origin",
		cache: "no-store",
		headers: {
			...(options.body && !(options.body instanceof FormData)
				? { "Content-Type": "application/json" }
				: {}),
			...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
			...options.headers,
		},
		signal: options.signal ?? AbortSignal.timeout(45_000),
	});
	let body: unknown;
	try {
		body = await response.json();
	} catch {
		throw new Error("The library could not respond. Please try again.");
	}
	if (!response.ok) {
		const message =
			body && typeof body === "object" && "error" in body
				? body.error
				: undefined;
		throw new Error(
			typeof message === "string"
				? message
				: "This operation could not be completed. Please try again.",
		);
	}
	return body as T;
}

export function loadCatalogSkill(
	id: string,
	signal?: AbortSignal,
): Promise<CatalogSkill & Pick<SkillPackage, "files">> {
	return labRequest<CatalogSkill & Pick<SkillPackage, "files">>(
		`/api/skills/${encodeURIComponent(id)}`,
		{ signal },
	);
}
