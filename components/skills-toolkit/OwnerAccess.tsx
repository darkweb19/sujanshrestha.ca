"use client";

import { useState, type FormEvent } from "react";
import { labRequest, type OwnerSession } from "@/lib/skills-toolkit/client-api";
import { Button, Dialog, Feedback, ExternalArrow } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

export default function OwnerAccess({
	session,
	onSession,
	onClose,
}: {
	session: OwnerSession;
	onSession: (session: OwnerSession) => void;
	onClose: () => void;
}) {
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	async function submit(event: FormEvent) {
		event.preventDefault();
		setError("");
		if (!password) {
			setError("Enter the owner password to continue.");
			document.getElementById("owner-password")?.focus();
			return;
		}
		setBusy(true);
		try {
			await labRequest("/api/lab/session", {
				method: "POST",
				body: JSON.stringify({ password }),
			});
			onSession(await labRequest<OwnerSession>("/api/lab/session"));
			setPassword("");
			onClose();
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Sign-in failed. Please try again.",
			);
		} finally {
			setBusy(false);
		}
	}
	return (
		<Dialog
			title="Owner access"
			onClose={() => {
				if (!busy) onClose();
			}}
			closeDisabled={busy}
		>
			<p>
				Everyone can browse and download. Only the library owner can import,
				edit, or remove skills.
			</p>
			{session.configured ? (
				<form
					noValidate
					onSubmit={(event) => void submit(event)}
					className={styles.importForm}
				>
					<label htmlFor="owner-password">Owner password</label>
					<div className={styles.passwordField}>
						<input
							id="owner-password"
							type={show ? "text" : "password"}
							autoComplete="current-password"
							value={password}
							disabled={busy}
							aria-invalid={!!error || undefined}
							aria-describedby={error ? "owner-error" : undefined}
							onChange={(event) => setPassword(event.target.value)}
						/>
						<Button
							disabled={busy}
							aria-label={show ? "Hide password" : "Show password"}
							aria-pressed={show}
							onClick={() => setShow(!show)}
						>
							{show ? "Hide" : "Show"}
						</Button>
					</div>
					{error && (
						<div id="owner-error">
							<Feedback error>{error}</Feedback>
						</div>
					)}
					<div className={styles.actions}>
						<Button type="submit" variant="primary" disabled={busy}>
							{busy ? "Signing in…" : "Sign in"}
						</Button>
						<Button onClick={onClose} disabled={busy}>
							Cancel
						</Button>
					</div>
				</form>
			) : (
				<div className={styles.ownerSetup}>
					<Feedback>
						Uploads are not enabled on this deployment yet. Configure owner
						access to save skills to the shared library.
					</Feedback>
					<p>
						Set the owner credentials and exact site origin on the service
						running this Lab, then redeploy.
					</p>
					<a
						href="https://github.com/darkweb19/sujanshrestha.ca/blob/feat/redesign/docs/railway-sqlite.md#upload-skills-from-the-lab"
						target="_blank"
						rel="noopener noreferrer"
					>
						Owner setup instructions <ExternalArrow />
					</a>
				</div>
			)}
		</Dialog>
	);
}
