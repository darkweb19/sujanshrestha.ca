"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	labRequest,
	loadCatalogSkill,
	type CatalogPage,
	type CatalogSkill,
	type OwnerSession,
} from "@/lib/skills-toolkit/client-api";
import {
	HARNESSES,
	getHarness,
	getCompatibilityIssues,
} from "@/lib/skills-toolkit/harnesses";
import { generateSkillZip } from "@/lib/skills-toolkit/archive";
import { loadImportedSkills } from "@/lib/skills-toolkit/storage";
import { rawSkillUrl } from "@/lib/skills-toolkit/skill-links";
import { validateSelection } from "@/lib/skills-toolkit/validation";
import type { HarnessId, SkillPackage } from "@/lib/skills-toolkit/types";
import ArchiveTree from "./ArchiveTree";
import ImportSkills from "./ImportSkills";
import SkillPreview from "./SkillPreview";
import PromptLauncher from "./PromptLauncher";
import OwnerAccess from "./OwnerAccess";
import { Button, Dialog, ExternalArrow, Feedback } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

type LoadedSkill = SkillPackage & { managed: boolean; revision: number };
const defaultSession: OwnerSession = {
	authenticated: false,
	configured: false,
};
function messageOf(cause: unknown, fallback: string) {
	return cause instanceof Error ? cause.message : fallback;
}
function saveZip(bytes: Uint8Array, name: string) {
	const url = URL.createObjectURL(
		new Blob([new Uint8Array(bytes)], { type: "application/zip" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = name;
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export default function SkillsToolkit({
	initial,
	initialQuery = "",
	initialCategory = "all",
	unavailable = false,
}: {
	initial: CatalogPage;
	initialQuery?: string;
	initialCategory?: string;
	unavailable?: boolean;
}) {
	const [catalog, setCatalog] = useState(initial);
	const [known, setKnown] = useState<Record<string, CatalogSkill>>(() =>
		Object.fromEntries(initial.skills.map((skill) => [skill.id, skill])),
	);
	const [loaded, setLoaded] = useState<Record<string, LoadedSkill>>({});
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [query, setQuery] = useState(initialQuery);
	const [category, setCategory] = useState(initialCategory);
	const [page, setPage] = useState(initial.page);
	const [composing, setComposing] = useState(false);
	const [refresh, setRefresh] = useState(0);
	const [loading, setLoading] = useState(false);
	const [catalogError, setCatalogError] = useState(
		unavailable
			? "The skills library is temporarily unavailable. Please try again."
			: "",
	);
	const [harnessId, setHarnessId] = useState<HarnessId>("codex");
	const [installed, setInstalled] = useState(false);
	const [session, setSession] = useState<OwnerSession>(defaultSession);
	const [sessionReady, setSessionReady] = useState(false);
	const [sessionError, setSessionError] = useState("");
	const [ownerOpen, setOwnerOpen] = useState(false);
	const [uploadAfterSignIn, setUploadAfterSignIn] = useState(false);
	const [message, setMessage] = useState("");
	const [copiedLink, setCopiedLink] = useState<{ url: string; name: string; copied: boolean } | null>(null);
	const manualLink = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (copiedLink && !copiedLink.copied) {
			manualLink.current?.focus();
			manualLink.current?.select();
		}
	}, [copiedLink]);
	async function copySkillLink(skill: CatalogSkill) {
		const url = rawSkillUrl(skill);
		try {
			await navigator.clipboard.writeText(url);
			setCopiedLink({ url, name: skill.name, copied: true });
		} catch {
			setCopiedLink({ url, name: skill.name, copied: false });
		}
	}
	const [error, setError] = useState("");
	const [importOpen, setImportOpen] = useState(false);
	const [previewId, setPreviewId] = useState<string | null>(null);
	const [previewBusy, setPreviewBusy] = useState<string | null>(null);
	const [remove, setRemove] = useState<LoadedSkill | null>(null);
	const [legacy, setLegacy] = useState<SkillPackage[] | null>(null);
	const [legacyBusy, setLegacyBusy] = useState(false);
	const [busy, setBusy] = useState(false);
	const search = useRef<HTMLInputElement>(null);
	const firstSearch = useRef(true);
	const previousQuery = useRef(initialQuery);
	const harness = getHarness(harnessId);
	const selected = useMemo(
		() =>
			selectedIds.flatMap((id) =>
				loaded[id]
					? [loaded[id]]
					: known[id]
						? [{ ...known[id], files: [] }]
						: [],
			),
		[selectedIds, known, loaded],
	);
	const preview = previewId ? loaded[previewId] : undefined;
	const unresolved = selected.some((skill) => !skill.files.length);
	const issues = useMemo(() => {
		if (unresolved || !selected.length) return [];
		const selection = validateSelection(selected, harness);
		const compatibility = selected.flatMap((skill) =>
			getCompatibilityIssues(skill, harness).map((issue) => ({
				...issue,
				message: `${skill.name}: ${issue.message}`,
			})),
		);
		return [...selection, ...compatibility];
	}, [selected, harness, unresolved]);
	const hasErrors = issues.some((issue) => issue.severity === "error");
	const pages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize));
	const folderRoot = category === "all" && !query.trim();
	function openFolder(next: string) {
		setCategory(next);
		setPage(1);
	}

	const checkSession = useCallback(async () => {
		setSessionError("");
		try {
			setSession(await labRequest<OwnerSession>("/api/lab/session"));
			setSessionReady(true);
		} catch {
			setSessionError(
				"Owner access could not be checked. Browsing and downloads are still available.",
			);
		}
	}, []);
	useEffect(() => {
		void checkSession();
	}, [checkSession]);
	useEffect(() => {
		if (composing) {
			setLoading(false);
			return;
		}
		if (firstSearch.current) {
			firstSearch.current = false;
			return;
		}
		const controller = new AbortController();
		const queryChanged = query !== previousQuery.current;
		previousQuery.current = query;
		const timer = setTimeout(
			() => {
				setLoading(true);
				setCatalogError("");
				const params = new URLSearchParams({
					page: String(page),
					pageSize: String(initial.pageSize),
				});
				if (query.trim()) params.set("q", query.trim());
				if (category !== "all") params.set("category", category);
				const url = new URL(window.location.href);
				url.search = params.toString();
				window.history.replaceState(null, "", url);
				void labRequest<CatalogPage>(`/api/skills?${params}`, {
					signal: controller.signal,
				})
					.then((result) => {
						if (controller.signal.aborted) return;
						setCatalog(result);
						setKnown((previous) => ({
							...previous,
							...Object.fromEntries(
								result.skills.map((skill) => [skill.id, skill]),
							),
						}));
						if (result.page !== page) setPage(result.page);
					})
					.catch((cause) => {
						if (!controller.signal.aborted)
							setCatalogError(
								messageOf(cause, "Could not load skills. Please try again."),
							);
					})
					.finally(() => {
						if (!controller.signal.aborted) setLoading(false);
					});
			},
			queryChanged && query !== "" ? 300 : 0,
		);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query, category, page, composing, refresh, initial.pageSize]);
	const hydrate = useCallback(async (skills: SkillPackage[]) => {
		const packages = await Promise.all(
			skills.map((skill) =>
				skill.files.length
					? Promise.resolve(skill as LoadedSkill)
					: loadCatalogSkill(skill.id),
			),
		);
		setLoaded((previous) => ({
			...previous,
			...Object.fromEntries(packages.map((skill) => [skill.id, skill])),
		}));
		return packages;
	}, []);
	useEffect(() => {
		if (!unresolved) return;
		let active = true;
		void hydrate(selected).catch((cause) => {
			if (active)
				setError(
					messageOf(
						cause,
						"Could not load selected skills. Try selecting them again.",
					),
				);
		});
		return () => {
			active = false;
		};
	}, [selected, unresolved, hydrate]);
	function clearQuery(resetCategory = false) {
		setQuery("");
		setPage(1);
		if (resetCategory) setCategory("all");
		const url = new URL(window.location.href);
		url.searchParams.delete("q");
		url.searchParams.set("page", "1");
		if (resetCategory) url.searchParams.delete("category");
		window.history.replaceState(null, "", url);
		search.current?.focus();
	}
	function changeSelection(next: string[]) {
		setSelectedIds(next);
		setInstalled(false);
		setError("");
	}
	function toggle(skill: CatalogSkill) {
		changeSelection(
			selectedIds.includes(skill.id)
				? selectedIds.filter((id) => id !== skill.id)
				: [...selectedIds, skill.id],
		);
	}
	async function showPreview(skill: CatalogSkill) {
		if (previewBusy) return;
		setPreviewBusy(skill.id);
		setError("");
		try {
			await hydrate([{ ...skill, files: [] }]);
			setPreviewId(skill.id);
		} catch (cause) {
			setError(messageOf(cause, "Could not load this skill. Try again."));
		} finally {
			setPreviewBusy(null);
		}
	}
	function imported(result: { skills: SkillPackage[] }) {
		setRefresh((value) => value + 1);
		setMessage(
			`${result.skills.length} ${result.skills.length === 1 ? "skill imported" : "skills imported"} and saved to the library.`,
		);
	}
	async function importFiles(files: File[], signal: AbortSignal) {
		const body = new FormData();
		files.forEach((file) => body.append("files", file));
		imported(
			await labRequest<{ skills: SkillPackage[] }>(
				"/api/skills/import",
				{ method: "POST", body, signal },
				session.csrfToken,
			),
		);
	}
	async function importGitHub(githubUrl: string, signal: AbortSignal) {
		imported(
			await labRequest<{ skills: SkillPackage[] }>(
				"/api/skills/import",
				{ method: "POST", body: JSON.stringify({ githubUrl }), signal },
				session.csrfToken,
			),
		);
	}
	async function savePackage(skill: SkillPackage) {
		const original = loaded[skill.id];
		const saved = await labRequest<LoadedSkill>(
			`/api/skills/${encodeURIComponent(skill.id)}`,
			{
				method: "PUT",
				body: JSON.stringify({
					files: skill.files,
					revision: original.revision,
				}),
			},
			session.csrfToken,
		);
		setLoaded((previous) => ({ ...previous, [saved.id]: saved }));
		setRefresh((value) => value + 1);
		setInstalled(false);
	}
	async function removePackage() {
		if (!remove) return;
		setBusy(true);
		setError("");
		try {
			await labRequest(
				`/api/skills/${encodeURIComponent(remove.id)}`,
				{
					method: "DELETE",
					body: JSON.stringify({ revision: remove.revision }),
				},
				session.csrfToken,
			);
			changeSelection(selectedIds.filter((id) => id !== remove.id));
			setRefresh((value) => value + 1);
			setMessage(`${remove.name} removed from the library.`);
			setRemove(null);
		} catch (cause) {
			setError(messageOf(cause, "Could not remove this skill. Try again."));
		} finally {
			setBusy(false);
		}
	}
	async function download(
		skills: SkillPackage[] = selected,
		filename = `${harness.id}-skills.zip`,
	) {
		setBusy(true);
		setError("");
		setMessage("");
		try {
			const packages = skills === selected ? await hydrate(skills) : skills;
			const errors = [
				...validateSelection(packages, harness),
				...packages.flatMap((skill) => getCompatibilityIssues(skill, harness)),
			].filter((issue) => issue.severity === "error");
			if (errors.length)
				throw new Error(errors.map((issue) => issue.message).join(" "));
			saveZip(await generateSkillZip(packages, harness), filename);
			setMessage(
				`ZIP ready: ${packages.length} ${packages.length === 1 ? "skill" : "skills"} for ${harness.name}. Extract it into your repository root.`,
			);
		} catch (cause) {
			setError(
				messageOf(
					cause,
					"Could not generate the archive. Your selection is preserved.",
				),
			);
		} finally {
			setBusy(false);
		}
	}
	async function recoverLegacy() {
		setLegacyBusy(true);
		setError("");
		try {
			setLegacy(await loadImportedSkills());
		} catch (cause) {
			setError(
				messageOf(
					cause,
					"Could not read previous browser imports. Try using the original browser profile.",
				),
			);
		} finally {
			setLegacyBusy(false);
		}
	}
	async function migrateLegacy() {
		if (!legacy?.length) return;
		setBusy(true);
		setError("");
		try {
			imported(
				await labRequest<{ skills: SkillPackage[] }>(
					"/api/skills/import",
					{
						method: "POST",
						body: JSON.stringify({
							packages: legacy.map((skill) => ({
								files: skill.files,
								source: skill.source,
							})),
						}),
					},
					session.csrfToken,
				),
			);
			setLegacy(null);
		} catch (cause) {
			setError(
				messageOf(
					cause,
					"Could not import your previous skills. Browser copies remain unchanged.",
				),
			);
		} finally {
			setBusy(false);
		}
	}
	async function signOut() {
		try {
			setSession(
				await labRequest<OwnerSession>(
					"/api/lab/session",
					{ method: "DELETE" },
					session.csrfToken,
				),
			);
			setMessage("Signed out. Public browsing and downloads remain available.");
		} catch (cause) {
			setError(messageOf(cause, "Could not sign out. Try again."));
		}
	}
	return (
		<main
			className={`${styles.toolkit} section-container`}
			id="main-content"
			tabIndex={-1}
		>
			<header className={styles.pageHeading}>
				<div>
					<Link href="/#projects" className={styles.backLink}>
						Back to my work
					</Link>
					<p className={styles.eyebrow}>Lab / AI tools</p>
					<h1 className="display-title">Skills Toolkit</h1>
					<p className={styles.intro}>
						Good instructions travel.
						<br />
						Build a collection for your next repository.
					</p>
				</div>
				<div className={styles.headingAside}>
					<a
						href="https://github.com/darkweb19/skills"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.sourceLink}
					>
						Explore the source collection <ExternalArrow />
					</a>
					<p>
						Codex, Claude Code, Cursor, and Copilot.
						<br />
						Original instructions. Complete packages.
					</p>
				</div>
			</header>
			{message && <Feedback>{message}</Feedback>}
			{copiedLink && <Feedback error={!copiedLink.copied}>
				<p>{copiedLink.copied ? `Copied the raw Markdown link for ${copiedLink.name}.` : "Clipboard access is unavailable. Copy the selected link below."}</p>
				<label className={styles.srOnly} htmlFor="raw-skill-link">Raw Markdown link</label>
				<input ref={manualLink} id="raw-skill-link" className={styles.rawLink} value={copiedLink.url} readOnly onFocus={(event) => event.currentTarget.select()} />
			</Feedback>}
			{error && !remove && !legacy && <Feedback error>{error}</Feedback>}
			{sessionError && (
				<Feedback error>
					{sessionError}{" "}
					<Button variant="quiet" onClick={() => void checkSession()}>
						Retry owner access
					</Button>
				</Feedback>
			)}
			<div className={styles.workspace}>
				<section className={styles.library} aria-labelledby="library-heading">
					<div className={styles.sectionHeading}>
						<div>
							<h2 id="library-heading">Skills library</h2>
							<p className={styles.help}>
								{catalog.total} {catalog.total === 1 ? "package" : "packages"}{" "}
								{category === "all" ? "in the collection" : `in ${category}`}
							</p>
						</div>
						<div className={styles.libraryActions}>
							<Button
								variant="primary"
								disabled={!sessionReady || busy}
								onClick={() => {
									if (session.authenticated) setImportOpen(true);
									else {
										setUploadAfterSignIn(true);
										setOwnerOpen(true);
									}
								}}
							>
								Upload skills <span aria-hidden="true">+</span>
							</Button>
							{!session.authenticated && (
								<Button
									variant="quiet"
									disabled={!sessionReady}
									onClick={() => {
										setUploadAfterSignIn(false);
										setOwnerOpen(true);
									}}
								>
									Owner sign in
								</Button>
							)}
						</div>
					</div>
					<div className={styles.uploadHint}>
						<p>
							<strong>SKILL.md or ZIP archives</strong> · You can also import
							from GitHub.
						</p>
						<p>
							{sessionError
								? "Owner access is unavailable. Retry the check above."
								: !sessionReady
									? "Checking owner access…"
									: session.authenticated
										? "Uploads are saved to the shared library and stay available across browsers."
										: session.configured
											? "Owner sign-in is required to upload. Everyone can browse and download."
											: "Uploads need owner setup on this deployment. Browsing and downloads remain available."}
						</p>
					</div>
					<div className={styles.filters}>
						<div className={styles.searchField}>
							<label className={styles.srOnly} htmlFor="skill-search">
								Search skills
							</label>
							<span aria-hidden="true" className={styles.searchIcon}>
								<svg
									viewBox="0 0 24 24"
									width="18"
									height="18"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.7"
								>
									<circle cx="10.5" cy="10.5" r="6.5" />
									<path d="m16 16 4 4" />
								</svg>
							</span>
							<input
								ref={search}
								id="skill-search"
								type="search"
								maxLength={200}
								value={query}
								onCompositionStart={() => setComposing(true)}
								onCompositionEnd={() => setComposing(false)}
								onKeyDown={(event) => {
									if (event.key === "Enter" && !event.nativeEvent.isComposing) {
										event.preventDefault();
										setRefresh((value) => value + 1);
									}
								}}
								onChange={(event) => {
									setQuery(event.target.value);
									setPage(1);
								}}
								placeholder="Search skills…"
							/>
							{query && (
								<button
									type="button"
									className={styles.clearSearch}
									aria-label="Clear search"
									onClick={() => clearQuery()}
								>
									×
								</button>
							)}
						</div>
						<div className={styles.categoryField}>
							<label className={styles.srOnly} htmlFor="skill-category">
								Filter by category
							</label>
							<select
								id="skill-category"
								value={category}
								onChange={(event) => {
									setCategory(event.target.value);
									setPage(1);
								}}
							>
								<option value="all">All categories</option>
								{catalog.categories.map((item) => (
									<option key={item}>{item}</option>
								))}
							</select>
						</div>
					</div>
					<nav className={styles.folderBreadcrumb} aria-label="Skill folders">
						<Button variant="quiet" onClick={() => openFolder("all")} aria-current={category === "all" ? "location" : undefined}>All folders</Button>
						{category !== "all" && <span aria-current="location">/ {category}</span>}
					</nav>
					<div className={styles.selectionToolbar}>
						<span role="status">
							{selected.length} selected{" "}
							<span className={styles.muted}>
								· {loading ? "Updating…" : `${catalog.total} results`}
							</span>{" "}
							<a href="#archive-heading" className={styles.mobileArchiveLink}>
								View archive
							</a>
						</span>
						<div>
							<Button
								variant="quiet"
								onClick={() =>
									changeSelection([
										...new Set([
											...selectedIds,
											...catalog.skills.map((skill) => skill.id),
										]),
									])
								}
								disabled={folderRoot || !catalog.skills.length || busy || loading}
							>
								Select all shown
							</Button>
							<Button
								variant="quiet"
								disabled={!selected.length || busy}
								onClick={() => changeSelection([])}
							>
								Clear selection
							</Button>
						</div>
					</div>
					{catalogError && (
						<Feedback error>
							{catalogError}{" "}
							<Button
								variant="quiet"
								onClick={() => setRefresh((value) => value + 1)}
							>
								Retry library
							</Button>
						</Feedback>
					)}
					<div aria-busy={loading} className={styles.results}>
						{folderRoot && !catalogError ? (
							<div>
								<p className={styles.help}>Open a folder to browse skills, or search across the collection.</p>
								<div className={styles.folderGrid}>
									{catalog.categories.map((item) => <button key={item} type="button" className={styles.folder} onClick={() => openFolder(item)} aria-label={`Open ${item} folder`}>
										<svg aria-hidden="true" width="32" height="28" viewBox="0 0 32 28" fill="none"><path d="M2 7V4a2 2 0 0 1 2-2h8l3 4h13a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z" fill="currentColor" opacity=".15"/><path d="M2 10h28M2 7V4a2 2 0 0 1 2-2h8l3 4h13a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5"/></svg>
										<span>{item}</span><ExternalArrow />
									</button>)}
								</div>
							</div>
						) : catalog.skills.length ? (
							<div className={styles.skillGrid}>
								{catalog.skills.map((skill) => (
									<article
										key={skill.id}
										className={`${styles.skillCard} ${selectedIds.includes(skill.id) ? styles.skillSelected : ""}`}
									>
										<div className={styles.skillCardHeading}>
											<input
												id={`select-${skill.id}`}
												type="checkbox"
												disabled={busy}
												checked={selectedIds.includes(skill.id)}
												onChange={() => toggle(skill)}
												aria-label={`Select ${skill.name}`}
											/>
										</div>
										<div className={styles.skillBody}>
											<div className={styles.skillTitle}>
												<h3>
													<button type="button" className={styles.skillCopy} onClick={() => void copySkillLink(skill)} aria-label={`Copy Markdown link for ${skill.name}`}>{skill.name}</button>
												</h3>
												<span className={styles.tag}>{skill.category}</span>
											</div>
											<p className={styles.skillDescription}>
												{skill.description}
											</p>
											<div className={styles.skillCardFooter}>
												<span className={styles.skillSource}>
													{skill.managed ? "Source collection" : "Owner import"}
													<span>{skill.fileCount} files · Click to copy link</span>
												</span>
												<a className={styles.rawSourceLink} href={rawSkillUrl(skill)} target="_blank" rel="noopener noreferrer">Raw Markdown</a>
												<Button
													variant="quiet"
													disabled={busy}
													aria-disabled={previewBusy === skill.id}
													aria-busy={previewBusy === skill.id}
													onClick={() => void showPreview(skill)}
													aria-label={`Preview ${skill.name}`}
												>
													{previewBusy === skill.id ? "Loading…" : "Preview"}{" "}
													<ExternalArrow />
												</Button>
											</div>
										</div>
									</article>
								))}
							</div>
						) : (
							!catalogError && (
								<div className={styles.empty}>
									<h3>No skills match your filters</h3>
									<p>Try another search or browse the complete collection.</p>
									<Button onClick={() => clearQuery(true)}>
										Reset filters
									</Button>
								</div>
							)
						)}
					</div>
					<nav hidden={folderRoot} className={styles.pagination} aria-label="Skills library pages">
						<Button
							disabled={page <= 1 || loading}
							onClick={() => setPage((value) => value - 1)}
						>
							Previous
						</Button>
						<span>
							Page {page} of {pages}
						</span>
						<Button
							disabled={page >= pages || loading}
							onClick={() => setPage((value) => value + 1)}
						>
							Next
						</Button>
					</nav>
				</section>
				<aside
					className={styles.archivePanel}
					aria-labelledby="archive-heading"
				>
					<div className={styles.archiveHeader}>
						<h2 id="archive-heading">Your archive</h2>
						<p className={styles.muted}>
							Choose an agent. Take the complete instructions with you.
						</p>
					</div>
					<div className={styles.field}>
						<label htmlFor="target-harness">Target AI Harness</label>
						<select
							id="target-harness"
							disabled={busy}
							value={harnessId}
							onChange={(event) => {
								setHarnessId(event.target.value as HarnessId);
								setInstalled(false);
							}}
						>
							{HARNESSES.map((item) => (
								<option value={item.id} key={item.id}>
									{item.name}
								</option>
							))}
						</select>
					</div>
					<div className={styles.archiveMeta}>
						<span>
							{selected.length} {selected.length === 1 ? "skill" : "skills"}{" "}
							selected
						</span>
						<span className={styles.muted}>
							{selected.reduce(
								(sum, skill) =>
									sum + (skill.files.length || known[skill.id]?.fileCount || 0),
								0,
							)}{" "}
							files
						</span>
					</div>
					<ArchiveTree skills={selected} harness={harness} />
					{unresolved && (
						<p className={styles.help} role="status">
							Loading complete packages…
						</p>
					)}
					{issues.length > 0 && (
						<details className={styles.validation} open={hasErrors}>
							<summary>
								{hasErrors
									? "Resolve validation errors"
									: `${issues.length} compatibility ${issues.length === 1 ? "note" : "notes"}`}
							</summary>
							<ul className={styles.issueList}>
								{issues.map((issue, index) => (
									<li key={index}>
										<strong>
											{issue.severity === "error" ? "Error" : "Warning"}:
										</strong>{" "}
										{issue.message}
									</li>
								))}
							</ul>
						</details>
					)}
					<Button
						variant="primary"
						className={styles.download}
						disabled={!selected.length || hasErrors || busy || unresolved}
						onClick={() => void download()}
					>
						{busy
							? "Preparing ZIP…"
							: `Download ${selected.length || ""} ${selected.length === 1 ? "Skill" : "Skills"} for ${harness.name}`}{" "}
						<svg
							viewBox="0 0 24 24"
							width="17"
							height="17"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.7"
							aria-hidden="true"
						>
							<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
						</svg>
					</Button>
					<p className={styles.downloadNote}>
						Only selected skills. Every supporting file.
					</p>
					<details className={styles.installation}>
						<summary>Install in your repository</summary>
						<ol>
							{harness.instructions.map((instruction, index) => (
								<li key={index}>{instruction}</li>
							))}
						</ol>
						<p className={styles.help}>
							Review instructions and scripts before using them with an AI
							agent. Downloads do not install anything.
						</p>
					</details>
				</aside>
			</div>
			<PromptLauncher
				skills={selected}
				harness={harness}
				installed={installed}
				onInstalledChange={setInstalled}
			/>
			<div className={styles.libraryNotes}>
				<p>
					The shared library keeps imports across browsers. Only its owner can
					change it.
				</p>
				<div>
					<Button
						variant="quiet"
						onClick={() => void recoverLegacy()}
						disabled={legacyBusy}
					>
						{legacyBusy
							? "Reading browser imports…"
							: "Recover previous browser imports"}
					</Button>
					{session.authenticated && (
						<Button variant="quiet" onClick={() => void signOut()}>
							Sign out
						</Button>
					)}
				</div>
			</div>
			{ownerOpen && (
				<OwnerAccess
					session={session}
					onSession={(next) => {
						setSession(next);
						if (next.authenticated && uploadAfterSignIn) setImportOpen(true);
					}}
					onClose={() => {
						setOwnerOpen(false);
						setUploadAfterSignIn(false);
					}}
				/>
			)}
			{importOpen && session.authenticated && (
				<ImportSkills
					onClose={() => setImportOpen(false)}
					onFiles={importFiles}
					onGitHub={importGitHub}
				/>
			)}
			{preview && (
				<SkillPreview
					key={preview.id}
					skill={preview}
					canEdit={session.authenticated && !preview.managed}
					onClose={() => setPreviewId(null)}
					onSave={savePackage}
					onRemove={() => {
						setPreviewId(null);
						setRemove(preview);
					}}
				/>
			)}
			{remove && (
				<Dialog
					title="Remove imported skill?"
					onClose={() => {
						if (!busy) {
							setRemove(null);
							setError("");
						}
					}}
					closeDisabled={busy}
				>
					<p>
						Remove <strong>{remove.name}</strong> and all supporting files from
						the shared library? Download a backup before removing it.
					</p>
					{error && <Feedback error>{error}</Feedback>}
					<div className={styles.actions}>
						<Button
							disabled={busy}
							onClick={() => {
								setRemove(null);
								setError("");
							}}
						>
							Keep skill
						</Button>
						<Button
							variant="danger"
							disabled={busy}
							onClick={() => void removePackage()}
						>
							{busy ? "Removing…" : "Remove skill"}
						</Button>
					</div>
				</Dialog>
			)}
			{legacy && (
				<Dialog
					title="Previous browser imports"
					onClose={() => {
						if (!busy) {
							setLegacy(null);
							setError("");
						}
					}}
					closeDisabled={busy}
				>
					<p>
						These skills are saved in this browser from the previous toolkit.
						Your original copies stay untouched.
					</p>
					{legacy.length ? (
						<>
							<ul className={styles.legacyList}>
								{legacy.map((skill) => (
									<li key={skill.id}>
										<strong>{skill.name}</strong>
										<span>{skill.files.length} files</span>
									</li>
								))}
							</ul>
							<p>
								Download a backup for any agent, or sign in as the owner to copy
								these packages into the shared library. Names already in the
								library must be resolved before importing.
							</p>
						</>
					) : (
						<p>No previous imports were found in this browser profile.</p>
					)}
					{error && <Feedback error>{error}</Feedback>}
					<div className={styles.actions}>
						{legacy.length > 0 && (
							<Button
								disabled={busy}
								onClick={() =>
									void download(legacy, `previous-${harness.id}-skills.zip`)
								}
							>
								Download browser backup
							</Button>
						)}
						{legacy.length > 0 && session.authenticated && (
							<Button
								variant="primary"
								disabled={busy}
								onClick={() => void migrateLegacy()}
							>
								{busy ? "Importing…" : "Import into shared library"}
							</Button>
						)}
						<Button disabled={busy} onClick={() => setLegacy(null)}>
							Close
						</Button>
					</div>
				</Dialog>
			)}
		</main>
	);
}
