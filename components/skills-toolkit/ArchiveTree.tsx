import type { HarnessAdapter, SkillPackage } from "@/lib/skills-toolkit/types";
import styles from "./toolkit.module.css";

type Node = { children: Map<string, Node> };
function FileNodes({ paths }: { paths: string[] }) {
	const tree: Node = { children: new Map() };
	for (const path of paths) {
		let cursor = tree;
		for (const segment of path.split("/")) {
			if (!cursor.children.has(segment))
				cursor.children.set(segment, { children: new Map() });
			cursor = cursor.children.get(segment)!;
		}
	}
	function render(node: Node) {
		return (
			<ul>
				{[...node.children.entries()]
					.sort(
						([a, left], [b, right]) =>
							Number(right.children.size > 0) -
								Number(left.children.size > 0) || a.localeCompare(b),
					)
					.map(([name, child]) => (
						<li key={name}>
							{child.children.size ? (
								<details>
									<summary>{name}/</summary>
									{render(child)}
								</details>
							) : (
								<span className={styles.treeFile}>{name}</span>
							)}
						</li>
					))}
			</ul>
		);
	}
	return render(tree);
}

export default function ArchiveTree({
	skills,
	harness,
}: {
	skills: SkillPackage[];
	harness: HarnessAdapter;
}) {
	const parts = harness.skillRoot.split("/");
	return (
		<div
			className={styles.tree}
			aria-label={`ZIP file tree for ${harness.name}`}
		>
			<div className={styles.treeRoot}>{parts[0]}/</div>
			<div className={styles.treeBranch}>
				<div>{parts.slice(1).join("/")}/</div>
				{skills.length ? (
					<ul>
						{skills.map((skill) => (
							<li key={skill.id}>
								<details open={skills.length < 4}>
									<summary>
										{skill.slug}/{" "}
										<span className={styles.treeCount}>
											{skill.files.length} files
										</span>
									</summary>
									<FileNodes
										paths={
											skill.files.length
												? skill.files.map((file) => file.path)
												: ["SKILL.md"]
										}
									/>
								</details>
							</li>
						))}
					</ul>
				) : (
					<p className={styles.treeEmpty}>
						Select skills to build your archive.
					</p>
				)}
			</div>
		</div>
	);
}
