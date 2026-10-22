"use client";

import { useState } from "react";
import type { HarnessAdapter, SkillPackage } from "@/lib/skills-toolkit/types";
import { generatePrompt } from "@/lib/skills-toolkit/prompt";
import { Button, ExternalArrow, Feedback } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

export default function PromptLauncher({
	skills,
	harness,
	installed,
	onInstalledChange,
}: {
	skills: SkillPackage[];
	harness: HarnessAdapter;
	installed: boolean;
	onInstalledChange: (installed: boolean) => void;
}) {
	const [requirements, setRequirements] = useState("");
	const [prompt, setPrompt] = useState("");
	const [generatedFor, setGeneratedFor] = useState("");
	const [feedback, setFeedback] = useState("");
	const [error, setError] = useState("");
	const [expanded, setExpanded] = useState(false);
	const signature = `${harness.id}:${skills.map((skill) => skill.id + skill.files.find((file) => file.path === "SKILL.md")?.content).join("|")}:${installed}:${requirements}`;
	const stale = !!prompt && signature !== generatedFor;
	function generate() {
		setError("");
		setFeedback("");
		if (!skills.length) {
			setError("Select at least one skill before generating a prompt.");
			return;
		}
		if (!requirements.trim()) {
			setError("Describe the task you want your AI agent to complete.");
			document.getElementById("task-requirements")?.focus();
			return;
		}
		setPrompt(generatePrompt(skills, harness, requirements.trim(), installed));
		setGeneratedFor(signature);
		setFeedback("Prompt generated. Review and edit it before copying.");
	}
	async function copy() {
		try {
			await navigator.clipboard.writeText(prompt);
			setFeedback("Prompt copied to clipboard.");
			setError("");
		} catch {
			setError(
				"Clipboard access is unavailable. Select the prompt text and copy it manually.",
			);
			document.getElementById("generated-prompt")?.focus();
		}
	}
	return (
		<section className={styles.promptPanel} aria-labelledby="prompt-heading">
			<div className={styles.sectionHeading}>
				<div>
					<p className={styles.eyebrow}>Put your skills to work</p>
					<h2 id="prompt-heading">Task prompt</h2>
				</div>
				<span className={styles.tag}>{harness.name}</span>
			</div>
			<p className={styles.muted}>
				Describe the work, then build a prompt with the selected skill paths.
			</p>
			<div className={styles.promptGrid}>
				<div className={styles.promptInputs}>
					<label htmlFor="task-requirements">
						What would you like to build or improve?
					</label>
					<textarea
						id="task-requirements"
						className={`${styles.requirements} resize-none`}
						value={requirements}
						onChange={(event) => setRequirements(event.target.value)}
						placeholder="Review my API authentication flow and add tests for the highest-risk cases."
					/>
					<label className={styles.confirmCheck}>
						<input
							type="checkbox"
							checked={installed}
							onChange={(event) => onInstalledChange(event.target.checked)}
						/>
						<span>
							I confirm the selected skills are already installed under{" "}
							<code>{harness.skillRoot}/</code> in my target repository.
						</span>
					</label>
					<p className={styles.help}>
						Without confirmation, the prompt asks the agent to check
						installation first. Downloading a ZIP does not install skills.
					</p>
					<Button
						variant="primary"
						onClick={generate}
						disabled={!skills.length}
					>
						Generate prompt
					</Button>
				</div>
				<div className={styles.promptOutput}>
					<div className={styles.previewToolbar}>
						<label htmlFor="generated-prompt">Editable prompt</label>
						<Button
							variant="quiet"
							disabled={!prompt}
							onClick={() => setExpanded(!expanded)}
						>
							{expanded ? "Collapse prompt" : "Expand prompt"}
						</Button>
					</div>
					<textarea
						id="generated-prompt"
						className={`${styles.promptText} resize-none ${expanded ? styles.expandedEditor : ""}`}
						value={prompt}
						onChange={(event) => {
							setPrompt(event.target.value);
							setFeedback("");
						}}
						placeholder="Your generated prompt will appear here."
					/>
					{stale && (
						<p className={styles.warning}>
							Selection, harness, installation status, or task changed. Generate
							a new prompt to update the skill references.
						</p>
					)}
					<div className={styles.actions}>
						<Button disabled={!prompt} onClick={() => void copy()}>
							Copy prompt
						</Button>
						{harness.id === "codex" && (
							<a
								href="https://chatgpt.com/codex"
								target="_blank"
								rel="noopener noreferrer"
								className={`${styles.button} ${styles.secondary}`}
							>
								Open Codex Web <ExternalArrow />
							</a>
						)}
					</div>
					{harness.id === "codex" && (
						<p className={styles.help}>
							Opens Codex Web in a new tab. Paste your prompt there after
							choosing your repository.
						</p>
					)}
				</div>
			</div>
			{feedback && <Feedback>{feedback}</Feedback>}
			{error && <Feedback error>{error}</Feedback>}
		</section>
	);
}
