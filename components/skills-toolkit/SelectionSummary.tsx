"use client";

import type { SkillPackage } from "@/lib/skills-toolkit/types";
import { Button } from "./ToolkitPrimitives";
import styles from "./toolkit.module.css";

export default function SelectionSummary({ skills, busy, onRemove }: {
	skills: SkillPackage[];
	busy: boolean;
	onRemove: (id: string) => void;
}) {
	if (!skills.length) return <div className={styles.selectionEmpty}>
		<span aria-hidden="true">＋</span>
		<p>Your toolkit starts here.<small>Select skills from the library, then choose your agent.</small></p>
	</div>;
	return <ul className={styles.selectedList} aria-label="Selected skills">
		{skills.map((skill) => <li key={skill.id}>
			<span><strong>{skill.name}</strong><small>{skill.category}</small></span>
			<Button variant="quiet" disabled={busy} onClick={() => onRemove(skill.id)} aria-label={`Remove ${skill.name} from selection`} title={`Remove ${skill.name}`}>
				<span aria-hidden="true">×</span>
			</Button>
		</li>)}
	</ul>;
}
