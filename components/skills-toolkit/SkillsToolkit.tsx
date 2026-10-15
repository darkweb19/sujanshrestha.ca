"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUILTIN_SKILLS, BUILTIN_SKILL_MANIFEST, loadBuiltinSkill } from "@/lib/skills-toolkit/catalog";
import { HARNESSES, getHarness, getCompatibilityIssues } from "@/lib/skills-toolkit/harnesses";
import { generateSkillZip } from "@/lib/skills-toolkit/archive";
import { loadImportedSkills, saveImportedSkills, saveImportedSkill, deleteImportedSkill } from "@/lib/skills-toolkit/storage";
import { validateSelection } from "@/lib/skills-toolkit/validation";
import type { HarnessId, SkillPackage } from "@/lib/skills-toolkit/types";
import ArchiveTree from "./ArchiveTree";
import ImportSkills from "./ImportSkills";
import SkillPreview from "./SkillPreview";
import PromptLauncher from "./PromptLauncher";
import { Button, Dialog, ExternalArrow, Feedback } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

export default function SkillsToolkit() {
	const [imported, setImported] = useState<SkillPackage[]>([]);
	const [loaded, setLoaded] = useState<Record<string, SkillPackage>>({});
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("all");
	const [harnessId, setHarnessId] = useState<HarnessId>("codex");
	const [installed, setInstalled] = useState(false);
	const [storageReady, setStorageReady] = useState(false);
	const [storageError, setStorageError] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [importOpen, setImportOpen] = useState(false);
	const [previewId, setPreviewId] = useState<string | null>(null);
	const [previewBusy, setPreviewBusy] = useState<string | null>(null);
	const [remove, setRemove] = useState<SkillPackage | null>(null);
	const [busy, setBusy] = useState(false);
	const search = useRef<HTMLInputElement>(null);
	const harness = getHarness(harnessId);
	const catalog = useMemo(() => [...BUILTIN_SKILLS.map(skill => loaded[skill.slug] ?? skill), ...imported], [loaded, imported]);
	const selected = useMemo(() => catalog.filter(skill => selectedIds.includes(skill.id)), [catalog, selectedIds]);
	const filtered = useMemo(() => catalog.filter(skill => (category === "all" || skill.category === category) && `${skill.name} ${skill.slug} ${skill.description} ${skill.category} ${skill.source.label}`.toLowerCase().includes(query.trim().toLowerCase())), [catalog, category, query]);
	const categories = [...new Set(catalog.map(skill => skill.category))].sort();
	const preview = catalog.find(skill => skill.id === previewId);
	const issues = useMemo(() => {
		if (!selected.length) return [];
		const hydrated = selected.filter(skill => skill.files.length);
		const result = hydrated.length === selected.length ? validateSelection(selected, harness) : [];
		const compatibility = hydrated.flatMap(skill => getCompatibilityIssues(skill, harness).map(issue => ({ skill, issue })));
		const distinctSelection = result.filter(issue => !compatibility.some(entry => entry.issue.severity === issue.severity && entry.issue.path === issue.path && entry.issue.message === issue.message));
		return [...distinctSelection, ...compatibility.map(({ skill, issue }) => ({ ...issue, message: `${skill.name}: ${issue.message}` }))];
	}, [selected, harness]);
	const unresolved = selected.some(skill => !skill.files.length);
	const hasErrors = issues.some(issue => issue.severity === "error");
	const loadStorage = useCallback(async () => {
		setStorageError("");
		try { setImported(await loadImportedSkills()); setStorageReady(true); }
		catch (cause) { setStorageError(cause instanceof Error ? cause.message : "Browser storage is unavailable. Existing imports have not been loaded."); }
	}, []);
	useEffect(() => { void loadStorage(); }, [loadStorage]);
	const hydrate = useCallback(async (skills: SkillPackage[]) => {
		const packages = await Promise.all(skills.map(skill => skill.files.length ? skill : loadBuiltinSkill(skill.slug)));
		setLoaded(previous => ({ ...previous, ...Object.fromEntries(packages.filter(skill => skill.source.kind === "builtin").map(skill => [skill.slug, skill])) }));
		return packages;
	}, []);
	useEffect(() => {
		if (!unresolved) return;
		let active = true;
		void hydrate(selected).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Could not load selected skills. Try selecting them again."); });
		return () => { active = false; };
	}, [selected, unresolved, hydrate]);
	function changeSelection(next: string[]) { setSelectedIds(next); setInstalled(false); setError(""); }
	function toggle(skill: SkillPackage) { changeSelection(selectedIds.includes(skill.id) ? selectedIds.filter(id => id !== skill.id) : [...selectedIds, skill.id]); }
	async function showPreview(skill: SkillPackage) {
		setPreviewBusy(skill.id); setError("");
		try { await hydrate([skill]); setPreviewId(skill.id); }
		catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load this skill. Try again."); }
		finally { setPreviewBusy(null); }
	}
	async function importPackages(packages: SkillPackage[]) {
		if (!storageReady) throw new Error("Browser storage is unavailable. Retry loading storage before importing.");
		const existing = new Set(catalog.map(skill => skill.slug.toLowerCase()));
		for (const skill of packages) { if (existing.has(skill.slug.toLowerCase())) throw new Error(`A skill named “${skill.slug}” already exists. Edit or remove the imported version, or use a unique name in SKILL.md.`); existing.add(skill.slug.toLowerCase()); }
		await saveImportedSkills(packages);
		setImported(previous => [...previous, ...packages]);
		setMessage(`${packages.length} ${packages.length === 1 ? "skill imported" : "skills imported"} and saved in this browser.`);
	}
	async function savePackage(skill: SkillPackage) {
		if (catalog.some(item => item.id !== skill.id && item.slug.toLowerCase() === skill.slug.toLowerCase())) throw new Error(`The folder “${skill.slug}” already exists. Choose a unique name in SKILL.md.`);
		const original = imported.find(item => item.id === skill.id);
		const saved = await saveImportedSkill(skill, original?.importedAt); setImported(previous => previous.map(item => item.id === skill.id ? saved : item)); setInstalled(false);
	}
	async function removePackage() {
		if (!remove) return;
		setBusy(true); setError("");
		try { await deleteImportedSkill(remove.id); setImported(previous => previous.filter(skill => skill.id !== remove.id)); changeSelection(selectedIds.filter(id => id !== remove.id)); setMessage(`${remove.name} removed from this browser.`); setRemove(null); }
		catch (cause) { setError(cause instanceof Error ? cause.message : "Could not remove the skill. Try again."); }
		finally { setBusy(false); }
	}
	async function download() {
		setBusy(true); setError(""); setMessage("");
		try {
			const skills = await hydrate(selected);
			const errors = [...validateSelection(skills, harness), ...skills.flatMap(skill => getCompatibilityIssues(skill, harness))].filter(issue => issue.severity === "error");
			if (errors.length) throw new Error(errors.map(issue => issue.message).join(" "));
			const bytes = await generateSkillZip(skills, harness);
			const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/zip" }));
			const link = document.createElement("a"); link.href = url; link.download = `${harness.id}-skills.zip`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
			setMessage(`ZIP ready: ${skills.length} ${skills.length === 1 ? "skill" : "skills"} for ${harness.name}. Extract it into your repository root.`);
		} catch (cause) { setError(cause instanceof Error ? cause.message : "Could not generate the archive. Your selection is preserved."); }
		finally { setBusy(false); }
	}
	return <main className={`${styles.toolkit} section-container`} id="skills-toolkit">
		<header className={styles.pageHeading}><div><Link href="/#projects" className={styles.backLink}>← Back to my work</Link><p className={styles.eyebrow}>Lab / AI tools</p><h1>Skills Toolkit<span>.</span></h1><p className={styles.intro}>Your coding skills, ready for your next repository.<br className={styles.desktopBreak} /> Choose a few, pick your agent, and take the instructions with you.</p></div><a href="https://github.com/darkweb19/skills" target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>From my skills collection <ExternalArrow /></a></header>
		{storageError && <Feedback error>{storageError} <Button variant="quiet" onClick={() => void loadStorage()}>Retry browser storage</Button></Feedback>}
		{message && <Feedback>{message}</Feedback>}{error && !remove && <Feedback error>{error}</Feedback>}
		<div className={styles.workspace}>
		<section className={styles.library} aria-labelledby="library-heading">
			<div className={styles.sectionHeading}><div><h2 id="library-heading">Skills library</h2><p className={styles.help}>{BUILTIN_SKILLS.length} from my collection{imported.length ? ` · ${imported.length} imported` : ""}</p></div><Button onClick={() => setImportOpen(true)} disabled={!storageReady || busy}>Import skill <span aria-hidden="true">+</span></Button></div>
			<div className={styles.filters}><div className={styles.searchField}><label className={styles.srOnly} htmlFor="skill-search">Search skills</label><span aria-hidden="true" className={styles.searchIcon}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg></span><input ref={search} id="skill-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search skills…" />{query && <button type="button" className={styles.clearSearch} aria-label="Clear search" onClick={() => { setQuery(""); search.current?.focus(); }}>×</button>}</div><div className={styles.categoryField}><label className={styles.srOnly} htmlFor="skill-category">Filter by category</label><select id="skill-category" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></div></div>
			<div className={styles.selectionToolbar}><span role="status">{selected.length} selected <span className={styles.muted}>· {filtered.length} shown</span> <a href="#archive-heading" className={styles.mobileArchiveLink}>View archive ↓</a></span><div><Button variant="quiet" onClick={() => changeSelection([...new Set([...selectedIds, ...filtered.map(skill => skill.id)])])} disabled={!filtered.length || busy}>{query || category !== "all" ? "Select all shown" : "Select all"}</Button><Button variant="quiet" disabled={!selected.length || busy} onClick={() => changeSelection([])}>Clear selection</Button></div></div>
			{filtered.length ? <div className={styles.skillGrid}>{filtered.map(skill => <article key={skill.id} className={`${styles.skillCard} ${selectedIds.includes(skill.id) ? styles.skillSelected : ""}`}>
				<div className={styles.skillCardHeading}><input id={`select-${skill.id}`} type="checkbox" disabled={busy} checked={selectedIds.includes(skill.id)} onChange={() => toggle(skill)} aria-label={`Select ${skill.name}`} /><span className={styles.tag}>{skill.category}</span></div>
				<h3><label htmlFor={`select-${skill.id}`}>{skill.name}</label></h3><p className={styles.skillDescription}>{skill.description}</p>
				<div className={styles.skillCardFooter}><span className={styles.skillSource} title={skill.source.label}>{skill.source.kind === "builtin" ? "darkweb19/skills" : skill.source.kind === "github" ? "GitHub import" : "Local import"}<span>{skill.files.length || BUILTIN_SKILL_MANIFEST[skill.slug]?.fileCount || 0} files</span></span><Button variant="quiet" disabled={previewBusy === skill.id || busy} onClick={() => void showPreview(skill)} aria-label={`Preview ${skill.name}`}>{previewBusy === skill.id ? "Loading…" : "Preview"} <ExternalArrow /></Button></div>
			</article>)}</div> : <div className={styles.empty}><h3>No skills match your filters</h3><p>Try a different search or browse the full collection.</p><Button onClick={() => { setQuery(""); setCategory("all"); search.current?.focus(); }}>Reset filters</Button></div>}
		</section>
		<aside className={styles.archivePanel} aria-labelledby="archive-heading"><div className={styles.archiveHeader}><p className={styles.eyebrow}>Repository-ready</p><h2 id="archive-heading">Your skill archive</h2><p className={styles.muted}>Same instructions. The right home for your agent.</p></div>
			<div className={styles.field}><label htmlFor="target-harness">Target AI Harness</label><select id="target-harness" disabled={busy} value={harnessId} onChange={event => { setHarnessId(event.target.value as HarnessId); setInstalled(false); }}>{HARNESSES.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
			<div className={styles.archiveMeta}><span>{selected.length} {selected.length === 1 ? "skill" : "skills"} selected</span><span className={styles.muted}>{selected.reduce((sum, skill) => sum + (skill.files.length || BUILTIN_SKILL_MANIFEST[skill.slug]?.fileCount || 0), 0)} files</span></div>
			<ArchiveTree skills={selected} harness={harness} />
			{unresolved && <p className={styles.help} role="status">Loading complete skill packages for validation…</p>}
			{issues.length > 0 && <details className={styles.validation} open={hasErrors}><summary>{hasErrors ? "Resolve validation errors" : `${issues.length} compatibility ${issues.length === 1 ? "note" : "notes"}`}</summary><ul className={styles.issueList}>{issues.map((issue, index) => <li key={index}><strong>{issue.severity === "error" ? "Error" : "Warning"}:</strong> {issue.message}</li>)}</ul></details>}
			<Button variant="primary" className={styles.download} disabled={!selected.length || hasErrors || busy} onClick={() => void download()}>{busy ? "Preparing ZIP…" : `Download ${selected.length || ""} ${selected.length === 1 ? "Skill" : "Skills"} for ${harness.name}`} <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg></Button>
			<p className={styles.downloadNote}>Built in your browser. Only selected skills included.</p>
			<details className={styles.installation}><summary>Install in your repository</summary><ol>{harness.instructions.map((instruction, index) => <li key={index}>{instruction}</li>)}</ol><p className={styles.help}>Review imported instructions and scripts before using them with an AI agent.</p></details>
		</aside></div>
		<PromptLauncher skills={selected} harness={harness} installed={installed} onInstalledChange={setInstalled} />
		<p className={styles.privacyNote}>Imported skills are stored in this browser, not uploaded to a server. Browser data can be cleared; keep a ZIP backup of your collection.</p>
		{importOpen && <ImportSkills onClose={() => setImportOpen(false)} onImport={importPackages} />}
		{preview && <SkillPreview key={preview.id} skill={preview} onClose={() => setPreviewId(null)} onSave={savePackage} onRemove={skill => { setPreviewId(null); setRemove(skill); }} />}
		{remove && <Dialog title="Remove imported skill?" onClose={() => { if (!busy) { setRemove(null); setError(""); } }}><p>Remove <strong>{remove.name}</strong> and all its supporting files from this browser? Export a backup first if you want to keep it.</p>{error && <Feedback error>{error}</Feedback>}<div className={styles.actions}><Button variant="danger" disabled={busy} onClick={() => void removePackage()}>{busy ? "Removing…" : "Remove skill"}</Button><Button disabled={busy} onClick={() => { setRemove(null); setError(""); }}>Keep skill</Button></div></Dialog>}
	</main>;
}
