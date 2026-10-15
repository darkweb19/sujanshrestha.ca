"use client";

import { useRef, useState, type FormEvent } from "react";
import { importSkillZip } from "@/lib/skills-toolkit/archive";
import { importGitHubSkills } from "@/lib/skills-toolkit/github";
import { bytesToSkillFile, parseSkillFiles, validateSelection } from "@/lib/skills-toolkit/validation";
import { ARCHIVE_LIMITS, type SkillPackage } from "@/lib/skills-toolkit/types";
import { Button, Dialog, Feedback } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

export default function ImportSkills({ onClose, onImport }: { onClose: () => void; onImport: (skills: SkillPackage[]) => Promise<void> }) {
	const [files, setFiles] = useState<File[]>([]);
	const [url, setUrl] = useState("");
	const [busy, setBusy] = useState<"local" | "github" | null>(null);
	const [error, setError] = useState("");
	const [errorField, setErrorField] = useState<"local" | "github" | null>(null);
	function fail(message: string, kind: "local" | "github") { setError(message); setErrorField(kind); requestAnimationFrame(() => document.getElementById(kind === "local" ? "skill-upload" : "github-url")?.focus()); }
	const abort = useRef<AbortController | null>(null);
	function close() { abort.current?.abort(); onClose(); }
	async function run(kind: "local" | "github", event: FormEvent) {
		event.preventDefault();
		setError(""); setErrorField(null);
		if (kind === "local" && !files.length) { fail("Choose a SKILL.md file or ZIP archive to import.", "local"); return; }
		if (kind === "local" && files.length > 20) { fail("Choose no more than 20 files per import batch.", "local"); return; }
		if (kind === "local" && files.reduce((total, file) => total + file.size, 0) > ARCHIVE_LIMITS.maxCompressedBytes) { fail("The selected files exceed the 10 MB total upload limit. Import a smaller batch.", "local"); return; }
		if (kind === "github" && !url.trim()) { fail("Enter a public GitHub repository, folder, or SKILL.md URL.", "github"); return; }
		setBusy(kind);
		const controller = new AbortController(); abort.current = controller;
		try {
			let packages: SkillPackage[] = [];
			if (kind === "github") packages = await importGitHubSkills(url.trim(), controller.signal);
			else for (const file of files) {
				if (controller.signal.aborted) return;
				if (file.size > ARCHIVE_LIMITS.maxCompressedBytes) throw new Error(`${file.name} exceeds the 10 MB upload limit.`);
				const source = { kind: "local" as const, label: file.name };
				if (/\.zip$/i.test(file.name)) packages.push(...await importSkillZip(new Uint8Array(await file.arrayBuffer()), source));
				else if (/\.md$/i.test(file.name)) {
					if (file.size > ARCHIVE_LIMITS.maxFileBytes) throw new Error(`${file.name} exceeds the 2 MB Markdown limit.`);
					packages.push(parseSkillFiles([bytesToSkillFile("SKILL.md", new Uint8Array(await file.arrayBuffer()))], source));
				} else throw new Error(`Unsupported file: ${file.name}. Choose a Markdown file or ZIP archive.`);
				const errors = validateSelection(packages).filter(issue => issue.severity === "error");
				if (errors.length) throw new Error(errors.map(issue => issue.message).join(" "));
			}
			if (controller.signal.aborted) return;
			await onImport(packages);
			onClose();
		} catch (cause) { fail(controller.signal.aborted ? "Import cancelled. Your existing skills are unchanged." : cause instanceof Error ? cause.message : "Import failed. Check the source and try again.", kind); }
		finally { setBusy(null); abort.current = null; }
	}
	return <Dialog title="Import skills" onClose={close}>
		<p className={styles.muted}>Add your own instructions and supporting files. Imports stay in this browser.</p>
		{error && <div id="import-error"><Feedback error>{error}</Feedback></div>}
		<form noValidate onSubmit={(event) => void run("local", event)} className={styles.importForm}>
			<h3>From your computer</h3><label htmlFor="skill-upload">SKILL.md or ZIP archives</label>
			<input id="skill-upload" type="file" accept=".md,.zip,text/markdown,application/zip" multiple disabled={!!busy} onChange={event => setFiles([...event.target.files ?? []])} aria-invalid={errorField === "local" || undefined} aria-describedby={`upload-help${errorField === "local" ? " import-error" : ""}`} />
			<p id="upload-help" className={styles.help}>Up to 20 uploads and 10 MB total per batch; 25 MB unpacked, 256 package files, and 2 MB per package file. ZIP archives retain files inside each skill folder; repository-level files outside those folders are excluded. Scripts are never executed.</p>
			<Button type="submit" variant="primary" disabled={!!busy}>{busy === "local" ? "Importing files…" : "Import files"}</Button>
		</form>
		<form noValidate onSubmit={(event) => void run("github", event)} className={styles.importForm}>
			<h3>From GitHub</h3><label htmlFor="github-url">Public GitHub URL</label>
			<input id="github-url" type="url" value={url} disabled={!!busy} placeholder="https://github.com/darkweb19/skills" onChange={event => setUrl(event.target.value)} aria-invalid={errorField === "github" || undefined} aria-describedby={`github-help${errorField === "github" ? " import-error" : ""}`} />
			<p id="github-help" className={styles.help}>Use a public repository, skill folder, or SKILL.md link. Large repositories may require a link to a specific skill folder.</p>
			<div className={styles.actions}><Button type="submit" variant="primary" disabled={!!busy}>{busy === "github" ? "Importing from GitHub…" : "Import from GitHub"}</Button>{busy === "github" && <Button onClick={() => abort.current?.abort()}>Cancel import</Button>}</div>
		</form>
	</Dialog>;
}
