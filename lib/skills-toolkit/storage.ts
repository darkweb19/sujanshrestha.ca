import { ARCHIVE_LIMITS, type SkillFile, type SkillPackage, type SkillSource } from "./types";
import { parseSkillFiles, skillFileBytes } from "./validation";

const DATABASE = "personal-skills-toolkit";
const STORE = "imported-skills";
const MAX_SKILLS = 100;
const MAX_STORED_BYTES = 50 * 1024 * 1024;

function storageError(cause?: unknown): Error {
	const name = cause && typeof cause === "object" && "name" in cause ? cause.name : "";
	return new Error(name === "QuotaExceededError"
		? "Browser storage is full. Export your skills, remove unused imports, and try again."
		: "Your imported skills could not be read or saved in this browser. Enable site storage, close other toolkit tabs, and retry. Export a ZIP to keep a backup.");
}

function openDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (typeof indexedDB === "undefined") { reject(storageError()); return; }
		let request: IDBOpenDBRequest;
		try { request = indexedDB.open(DATABASE, 1); }
		catch (error) { reject(storageError(error)); return; }
		let blocked = false;
		request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" }); };
		request.onblocked = () => { blocked = true; reject(storageError()); };
		request.onerror = () => reject(storageError(request.error));
		request.onsuccess = () => {
			if (blocked) { request.result.close(); return; }
			request.result.onversionchange = () => request.result.close();
			resolve(request.result);
		};
	});
}

function record(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Saved skill data is invalid. Restore a trusted skill ZIP or clear this site's imported skill storage.");
	return value as Record<string, unknown>;
}

/** Reparse untrusted persisted files; do not trust stored display metadata. */
function checkedSkill(value: unknown): SkillPackage {
	const item = record(value);
	const origin = record(item.source);
	if ((origin.kind !== "local" && origin.kind !== "github") || typeof origin.label !== "string" || !origin.label.trim() || origin.label.length > 512) throw new Error("Saved skill source metadata is invalid.");
	const source: SkillSource = { kind: origin.kind, label: origin.label };
	if (origin.url !== undefined) {
		if (typeof origin.url !== "string" || origin.url.length > 2048) throw new Error("Saved skill source URL is invalid.");
		let url: URL;
		try { url = new URL(origin.url); } catch { throw new Error("Saved skill source URL is invalid."); }
		if (origin.kind !== "github" || url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password || url.port) throw new Error("Saved skill source URL is invalid.");
		source.url = url.href;
	}
	if (!Array.isArray(item.files) || !item.files.length || item.files.length > ARCHIVE_LIMITS.maxFiles) throw new Error("Saved skill file count exceeds the storage limit.");
	const files: SkillFile[] = item.files.map((value: unknown) => {
		const file = record(value);
		if (typeof file.path !== "string" || typeof file.content !== "string" || (file.encoding !== "utf8" && file.encoding !== "base64") || file.content.length > Math.ceil(ARCHIVE_LIMITS.maxFileBytes / 3) * 4) throw new Error("Saved skill file is invalid or too large.");
		return { path: file.path, content: file.content, encoding: file.encoding };
	});
	const skill = parseSkillFiles(files, source);
	if (item.id !== skill.id) throw new Error("Saved skill ID does not match its package.");
	if (typeof item.importedAt !== "string" || !Number.isFinite(Date.parse(item.importedAt))) throw new Error("Saved skill import date is invalid.");
	skill.importedAt = item.importedAt;
	return skill;
}

function checkCollection(values: unknown[]): SkillPackage[] {
	if (values.length > MAX_SKILLS) throw new Error(`Browser storage supports at most ${MAX_SKILLS} imported skills. Export and remove unused skills first.`);
	let total = 0;
	const ids = new Set<string>();
	const slugs = new Set<string>();
	return values.map((value) => {
		const skill = checkedSkill(value);
		if (ids.has(skill.id)) throw new Error("Duplicate saved skill ID.");
		if (slugs.has(skill.slug)) throw new Error(`The skill folder “${skill.slug}” is already imported from another source. Remove it explicitly before importing a replacement.`);
		ids.add(skill.id);
		slugs.add(skill.slug);
		for (const file of skill.files) total += skillFileBytes(file).length;
		if (total > MAX_STORED_BYTES) throw new Error("Imported skills exceed the 50 MB browser storage limit. Export and remove unused skills first.");
		return skill;
	});
}

export async function loadImportedSkills(): Promise<SkillPackage[]> {
	const db = await openDatabase();
	try {
		return await new Promise<SkillPackage[]>((resolve, reject) => {
			const transaction = db.transaction(STORE, "readonly");
			const request = transaction.objectStore(STORE).getAll(undefined, MAX_SKILLS + 1);
			let result: SkillPackage[];
			let validationError: unknown;
			request.onsuccess = () => {
				try { result = checkCollection(request.result); }
				catch (error) { validationError = error; transaction.abort(); }
			};
			transaction.oncomplete = () => resolve(result);
			transaction.onabort = transaction.onerror = () => reject(validationError ?? storageError(transaction.error));
		});
	} catch (error) { if (error instanceof Error) throw error; throw storageError(error); }
	finally { db.close(); }
}

/** Add an import batch atomically, or update one existing skill with a stale-tab guard. */
async function persistSkills(values: SkillPackage[], expectedImportedAt?: string): Promise<void> {
	const additions = checkCollection(values);
	const db = await openDatabase();
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE, "readwrite");
			const store = transaction.objectStore(STORE);
			const request = store.getAll(undefined, MAX_SKILLS + 1);
			let validationError: unknown;
			request.onsuccess = () => {
				try {
					const existing = checkCollection(request.result);
					const byId = new Map(existing.map((skill) => [skill.id, skill]));
					for (const skill of additions) {
						const previous = byId.get(skill.id);
						if (expectedImportedAt !== undefined) {
							if (additions.length !== 1 || previous?.importedAt !== expectedImportedAt) throw new Error("This skill changed in another tab or was removed. Reload the toolkit before saving your edits.");
						} else if (previous) throw new Error(`The skill “${skill.slug}” is already imported. Remove it explicitly before importing a replacement.`);
						byId.set(skill.id, skill);
					}
					checkCollection([...byId.values()]);
					for (const skill of additions) store.put(skill);
				} catch (error) { validationError = error; transaction.abort(); }
			};
			transaction.oncomplete = () => resolve();
			transaction.onabort = transaction.onerror = () => reject(validationError ?? storageError(transaction.error));
		});
	} catch (error) { if (error instanceof Error) throw error; throw storageError(error); }
	finally { db.close(); }
}

export async function saveImportedSkills(skills: SkillPackage[]): Promise<void> { return persistSkills(skills); }

export async function saveImportedSkill(skill: SkillPackage, expectedImportedAt?: string): Promise<SkillPackage> {
	const saved = checkedSkill(skill);
	if (expectedImportedAt !== undefined) {
		const timestamp = Date.parse(expectedImportedAt);
		if (!Number.isFinite(timestamp)) throw new Error("The original import date is missing. Reload the toolkit before editing this skill.");
		saved.importedAt = new Date(Math.max(Date.now(), timestamp + 1)).toISOString();
	}
	await persistSkills([saved], expectedImportedAt);
	return saved;
}

export async function deleteImportedSkill(id: string): Promise<void> {
	if (typeof id !== "string" || !id || id.length > 128) throw new Error("Invalid imported skill ID.");
	const db = await openDatabase();
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE, "readwrite");
			transaction.objectStore(STORE).delete(id);
			transaction.oncomplete = () => resolve();
			transaction.onabort = transaction.onerror = () => reject(storageError(transaction.error));
		});
	} finally { db.close(); }
}
