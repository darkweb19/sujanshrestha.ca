"use client";

import { useEffect, useState } from "react";
import {
	parseSkillFiles,
	validateSkillPackage,
} from "@/lib/skills-toolkit/validation";
import type { SkillPackage } from "@/lib/skills-toolkit/types";
import { Button, Dialog, ExternalArrow, Feedback } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

export default function SkillPreview({
	skill,
	onClose,
	onSave,
	onRemove,
	canEdit = false,
}: {
	skill: SkillPackage;
	onClose: () => void;
	onSave: (skill: SkillPackage) => Promise<void>;
	onRemove: (skill: SkillPackage) => void;
	canEdit?: boolean;
}) {
	const [files, setFiles] = useState(skill.files);
	const [path, setPath] = useState("SKILL.md");
	const [editing, setEditing] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [discard, setDiscard] = useState(false);
	const [saved, setSaved] = useState(false);
	const dirty = files.some(
		(file, index) => file.content !== skill.files[index]?.content,
	);
	const file = files.find((item) => item.path === path)!;
	useEffect(() => {
		function beforeUnload(event: BeforeUnloadEvent) {
			if (dirty) event.preventDefault();
		}
		window.addEventListener("beforeunload", beforeUnload);
		return () => window.removeEventListener("beforeunload", beforeUnload);
	}, [dirty]);
	function close() {
		if (busy) return;
		if (dirty) setDiscard(true);
		else onClose();
	}
	async function save() {
		setError("");
		setBusy(true);
		try {
			const parsed = parseSkillFiles(files, skill.source);
			if (parsed.slug !== skill.slug)
				throw new Error(
					"Keep the name in YAML frontmatter unchanged when editing. To create another skill, import it with a unique name.",
				);
			await onSave({ ...parsed, id: skill.id, importedAt: skill.importedAt });
			setEditing(false);
			setSaved(true);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Could not save changes. Your edit is still here.",
			);
		} finally {
			setBusy(false);
		}
	}
	const issues = validateSkillPackage({ ...skill, files });
	return (
		<Dialog title={skill.name} onClose={close} wide closeDisabled={busy}>
			<div className={styles.previewMeta}>
				<span className={styles.tag}>{skill.category}</span>
				<span>{files.length} files</span>
				<span>{skill.source.label}</span>
			</div>
			<p className={styles.muted}>{skill.description}</p>
			{skill.source.url &&
				/^https:\/\/(?:github\.com|raw\.githubusercontent\.com)\//.test(
					skill.source.url,
				) && (
					<a
						className={styles.sourceLink}
						href={skill.source.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						View original source <ExternalArrow />
					</a>
				)}
			{saved && <Feedback>Changes saved to the library.</Feedback>}
			{error && <Feedback error>{error}</Feedback>}
			{discard ? (
				<div className={styles.confirmInline}>
					<h3>Discard your changes?</h3>
					<p>Your saved skill will stay unchanged.</p>
					<div className={styles.actions}>
						<Button variant="danger" onClick={onClose}>
							Discard changes
						</Button>
						<Button onClick={() => setDiscard(false)}>Keep editing</Button>
					</div>
				</div>
			) : (
				<>
					<div className={styles.previewToolbar}>
						<div className={styles.field}>
							<label htmlFor="preview-file">Package file</label>
							<select
								id="preview-file"
								value={path}
								onChange={(event) => setPath(event.target.value)}
							>
								{files.map((item) => (
									<option key={item.path}>{item.path}</option>
								))}
							</select>
						</div>
						<Button variant="quiet" onClick={() => setExpanded(!expanded)}>
							{expanded ? "Collapse file" : "Expand file"}
						</Button>
					</div>
					{file.encoding === "base64" ? (
						<div className={styles.empty}>
							<strong>Binary supporting file</strong>
							<p>
								This file is preserved in downloads. It cannot be edited as
								text.
							</p>
						</div>
					) : editing ? (
						<>
							<label htmlFor="skill-content">Edit {path}</label>
							<textarea
								id="skill-content"
								spellCheck={false}
								className={`${styles.codeEditor} resize-none ${expanded ? styles.expandedEditor : ""}`}
								value={file.content}
								onChange={(event) => {
									setSaved(false);
									setFiles(
										files.map((item) =>
											item.path === path
												? { ...item, content: event.target.value }
												: item,
										),
									);
								}}
							/>
						</>
					) : (
						<pre
							className={`${styles.source} ${expanded ? styles.expandedSource : ""}`}
							tabIndex={0}
							aria-label={`${path} complete source`}
						>
							<code>{file.content}</code>
						</pre>
					)}
					<p className={styles.help}>
						Complete source, displayed as text. Imported HTML and scripts never
						run. When editing, keep the YAML name unchanged.
					</p>
					{issues.length > 0 && (
						<ul className={styles.issueList}>
							{issues.map((issue, index) => (
								<li key={index}>
									{issue.severity === "error" ? "Error: " : "Warning: "}
									{issue.path ? `${issue.path}: ` : ""}
									{issue.message}
								</li>
							))}
						</ul>
					)}
					{canEdit && (
						<div className={styles.previewFooter}>
							<div className={styles.actions}>
								{editing ? (
									<Button
										variant="primary"
										onClick={() => void save()}
										disabled={
											busy || issues.some((issue) => issue.severity === "error")
										}
									>
										{busy ? "Saving…" : "Save changes"}
									</Button>
								) : (
									<Button onClick={() => setEditing(true)}>Edit skill</Button>
								)}
								{editing && (
									<Button
										onClick={() => {
											if (dirty) setDiscard(true);
											else setEditing(false);
										}}
										disabled={busy}
									>
										Cancel edit
									</Button>
								)}
							</div>
							<Button
								variant="danger"
								onClick={() => {
									if (dirty) setDiscard(true);
									else onRemove(skill);
								}}
								disabled={busy}
							>
								Remove skill
							</Button>
						</div>
					)}
				</>
			)}
		</Dialog>
	);
}
