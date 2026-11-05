"use client";

import { useRef, useState, type FormEvent } from "react";
import { ARCHIVE_LIMITS } from "@/lib/skills-toolkit/types";
import { Button, Dialog, Feedback } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

export default function ImportSkills({
	onClose,
	onFiles,
	onGitHub,
}: {
	onClose: () => void;
	onFiles: (files: File[], signal: AbortSignal) => Promise<void>;
	onGitHub: (url: string, signal: AbortSignal) => Promise<void>;
}) {
	const [files, setFiles] = useState<File[]>([]);
	const [url, setUrl] = useState("");
	const [busy, setBusy] = useState<"local" | "github" | null>(null);
	const [error, setError] = useState("");
	const [errorField, setErrorField] = useState<"local" | "github" | null>(null);
	const abort = useRef<AbortController | null>(null);
	const picker = useRef<HTMLInputElement>(null);
	function fail(message: string, kind: "local" | "github") {
		setError(message);
		setErrorField(kind);
		requestAnimationFrame(() =>
			document
				.getElementById(kind === "local" ? "skill-upload" : "github-url")
				?.focus(),
		);
	}
	async function run(kind: "local" | "github", event: FormEvent) {
		event.preventDefault();
		setError("");
		setErrorField(null);
		if (kind === "local" && !files.length) {
			fail("Choose a SKILL.md file or ZIP archive to import.", kind);
			return;
		}
		if (kind === "local" && files.length > 20) {
			fail("Choose no more than 20 files per import batch.", kind);
			return;
		}
		if (kind === "local" && files.some((file) => !/\.(md|zip)$/i.test(file.name) || file.size === 0)) {
			fail("Choose non-empty Markdown (.md) or ZIP (.zip) files. Remove unsupported files from the queue.", kind);
			return;
		}
		if (
			kind === "local" &&
			files.reduce((total, file) => total + file.size, 0) >
				ARCHIVE_LIMITS.maxCompressedBytes
		) {
			fail(
				"The selected files exceed the 10 MB total upload limit. Import a smaller batch.",
				kind,
			);
			return;
		}
		if (kind === "github" && !url.trim()) {
			fail("Enter a public GitHub repository, folder, or SKILL.md URL.", kind);
			return;
		}
		setBusy(kind);
		const controller = new AbortController();
		abort.current = controller;
		try {
			if (kind === "local") await onFiles(files, controller.signal);
			else await onGitHub(url.trim(), controller.signal);
			onClose();
		} catch (cause) {
			fail(
				controller.signal.aborted
					? "The request was stopped. Refresh the library to check whether the import completed before trying again."
					: cause instanceof Error
						? cause.message
						: "Import failed. Check the source and try again.",
				kind,
			);
		} finally {
			setBusy(null);
			abort.current = null;
		}
	}
	return (
		<Dialog
			title="Upload skills"
			onClose={() => {
				if (!busy) onClose();
			}}
			closeDisabled={!!busy}
		>
			<p className={styles.muted}>
				Accepted packages are saved to the shared library. Review their source
				before importing; scripts are stored as files and never executed.
			</p>
			{error && (
				<div id="import-error">
					<Feedback error>{error}</Feedback>
				</div>
			)}
			<form
				noValidate
				aria-busy={busy === "local"}
				onSubmit={(event) => void run("local", event)}
				className={styles.importForm}
			>
				<h3>From your computer</h3>
				<label htmlFor="skill-upload">SKILL.md or ZIP archives</label>
				<input
					ref={picker}
					id="skill-upload"
					type="file"
					accept=".md,.zip,text/markdown,application/zip"
					multiple
					disabled={!!busy}
					onChange={(event) => setFiles([...(event.target.files ?? [])])}
					aria-invalid={errorField === "local" || undefined}
					aria-describedby={`upload-help${errorField === "local" ? " import-error" : ""}`}
				/>
				{files.length > 0 && <div className={styles.uploadQueue}>
					<p role="status">{files.length} {files.length === 1 ? "file" : "files"} queued · {(files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB</p>
					<ul aria-label="Upload queue">{files.map((file, index) => <li key={`${file.name}-${index}`}>
						<span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} KB</small></span>
						<Button variant="quiet" disabled={!!busy} aria-label={`Remove ${file.name} from upload queue`} onClick={() => {
							setFiles((previous) => previous.filter((_, position) => position !== index));
							if (picker.current) { picker.current.value = ""; picker.current.focus(); }
						}}>Remove</Button>
					</li>)}</ul>
				</div>}
				<p id="upload-help" className={styles.help}>
					Up to 20 uploads and 10 MB total per batch. Each package supports 256
					files, 2 MB per file, and 25 MB unpacked. ZIPs keep supporting files
					inside each skill directory.
				</p>
				<Button type="submit" variant="primary" disabled={!!busy} aria-busy={busy === "local"}>
					{busy === "local" ? "Uploading files…" : "Upload files"}
				</Button>
			</form>
			<form
				noValidate
				aria-busy={busy === "github"}
				onSubmit={(event) => void run("github", event)}
				className={styles.importForm}
			>
				<h3>From GitHub</h3>
				<label htmlFor="github-url">Public GitHub URL</label>
				<input
					id="github-url"
					type="url"
					value={url}
					disabled={!!busy}
					placeholder="https://github.com/darkweb19/skills"
					onChange={(event) => setUrl(event.target.value)}
					aria-invalid={errorField === "github" || undefined}
					aria-describedby={`github-help${errorField === "github" ? " import-error" : ""}`}
				/>
				<p id="github-help" className={styles.help}>
					Use a public repository, skill folder, or SKILL.md link. For large
					repositories, import a specific skill folder. If GitHub is
					unavailable, download its ZIP and import the file above.
				</p>
				<div className={styles.actions}>
					<Button type="submit" variant="primary" disabled={!!busy} aria-busy={busy === "github"}>
						{busy === "github"
							? "Importing from GitHub…"
							: "Import from GitHub"}
					</Button>
					{busy && (
						<Button onClick={() => abort.current?.abort()}>Stop request</Button>
					)}
				</div>
			</form>
		</Dialog>
	);
}
