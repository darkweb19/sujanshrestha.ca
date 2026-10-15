import { Inflate, zipSync } from "fflate";
import { getCompatibilityIssues } from "./harnesses";
import { ARCHIVE_LIMITS, type HarnessAdapter, type SkillPackage, type SkillSource } from "./types";
import { bytesToSkillFile, canonicalArchivePath, parseSkillFiles, skillFileBytes, validateArchivePath, validateSelection } from "./validation";

interface ZipEntry { path: string; directory: boolean; bytes: Uint8Array; }

const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
	for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
	return value >>> 0;
});

function crc32(bytes: Uint8Array): number {
	let value = 0xffffffff;
	for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
	return (value ^ 0xffffffff) >>> 0;
}

/** Inspect central and local headers before allocating any decompression buffers. */
function inspectZip(bytes: Uint8Array): ZipEntry[] {
	if (bytes.length > ARCHIVE_LIMITS.maxCompressedBytes) throw new Error("ZIP exceeds the 10 MB upload limit.");
	if (bytes.length < 22) throw new Error("Invalid ZIP: end-of-directory record is missing.");
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const u16 = (at: number) => view.getUint16(at, true);
	const u32 = (at: number) => view.getUint32(at, true);
	let end = -1;
	for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 65557); at--) {
		if (u32(at) === 0x06054b50 && at + 22 + u16(at + 20) === bytes.length) { end = at; break; }
	}
	if (end < 0) throw new Error("Invalid ZIP: end-of-directory record is missing.");
	if (u16(end + 4) || u16(end + 6) || u16(end + 8) !== u16(end + 10)) throw new Error("Multi-disk ZIP archives are not supported.");
	const count = u16(end + 10);
	const centralSize = u32(end + 12);
	const centralOffset = u32(end + 16);
	if (count === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) throw new Error("ZIP64 archives are not supported.");
	if (!count || count > ARCHIVE_LIMITS.maxFiles) throw new Error("ZIP must contain between 1 and 256 entries.");
	if (centralOffset + centralSize !== end) throw new Error("Invalid ZIP central-directory bounds.");
	let offset = centralOffset;
	let expandedTotal = 0;
	const seen = new Set<string>();
	const headers: { path: string; directory: boolean; compression: number; compressed: number; expanded: number; crc: number; start: number; stop: number }[] = [];
	const decoder = new TextDecoder("utf-8", { fatal: true });
	for (let index = 0; index < count; index++) {
		if (offset + 46 > end || u32(offset) !== 0x02014b50) throw new Error("Invalid ZIP central-directory entry.");
		const flags = u16(offset + 8);
		const compression = u16(offset + 10);
		const crc = u32(offset + 16);
		const compressed = u32(offset + 20);
		const expanded = u32(offset + 24);
		const nameLength = u16(offset + 28);
		const extraLength = u16(offset + 30);
		const commentLength = u16(offset + 32);
		const localOffset = u32(offset + 42);
		if (offset + 46 + nameLength + extraLength + commentLength > end) throw new Error("Truncated ZIP directory entry.");
		if (flags & 0x2041) throw new Error("Encrypted ZIP entries are not supported.");
		if (compression !== 0 && compression !== 8) throw new Error("Only stored and deflated ZIP entries are supported.");
		if (compressed === 0xffffffff || expanded === 0xffffffff || localOffset === 0xffffffff || u16(offset + 34)) throw new Error("ZIP64 and multi-disk entries are not supported.");
		const mode = u32(offset + 38) >>> 16;
		const kind = mode & 0xf000;
		if (kind && kind !== 0x8000 && kind !== 0x4000) throw new Error("Symlinks and special files are not supported in skill archives.");
		let name: string;
		try { name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength)); }
		catch { throw new Error("ZIP filenames must contain valid UTF-8 text."); }
		const directory = name.endsWith("/");
		const path = directory ? name.slice(0, -1) : name;
		const unsafe = validateArchivePath(path);
		if (unsafe) throw new Error(`Unsafe ZIP entry “${path}”: ${unsafe}`);
		const key = canonicalArchivePath(path);
		if (seen.has(key)) throw new Error(`Duplicate ZIP path or case collision: ${path}`);
		seen.add(key);
		if (expanded > ARCHIVE_LIMITS.maxFileBytes) throw new Error(`ZIP entry exceeds the 2 MB file limit: ${path}`);
		expandedTotal += expanded;
		if (expandedTotal > ARCHIVE_LIMITS.maxUncompressedBytes) throw new Error("ZIP exceeds the 25 MB uncompressed limit.");
		if (directory && expanded) throw new Error("ZIP directories must be empty.");
		if (localOffset + 30 > centralOffset || u32(localOffset) !== 0x04034b50) throw new Error("Invalid ZIP local-file header.");
		const localNameLength = u16(localOffset + 26);
		const localExtraLength = u16(localOffset + 28);
		const start = localOffset + 30 + localNameLength + localExtraLength;
		const stop = start + compressed;
		if (stop > centralOffset || start > centralOffset) throw new Error("ZIP file data exceeds archive bounds.");
		if (u16(localOffset + 6) !== flags || u16(localOffset + 8) !== compression) throw new Error("ZIP local and directory headers disagree.");
		if (!(flags & 8) && (u32(localOffset + 14) !== crc || u32(localOffset + 18) !== compressed || u32(localOffset + 22) !== expanded)) throw new Error("ZIP size or checksum headers disagree.");
		let localName: string;
		try { localName = decoder.decode(bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength)); }
		catch { throw new Error("ZIP local filename is invalid."); }
		if (localName !== name) throw new Error("ZIP local and directory filenames disagree.");
		if (compression === 0 && compressed !== expanded) throw new Error("Stored ZIP entry has inconsistent sizes.");
		if (headers.some((entry) => localOffset < entry.stop && stop > entry.start)) throw new Error("ZIP entries have overlapping file data.");
		headers.push({ path, directory, compression, compressed, expanded, crc, start, stop });
		offset += 46 + nameLength + extraLength + commentLength;
	}
	if (offset !== centralOffset + centralSize) throw new Error("ZIP directory size is inconsistent.");
	for (const entry of headers) {
		if (headers.some((other) => !other.directory && canonicalArchivePath(entry.path).startsWith(`${canonicalArchivePath(other.path)}/`))) throw new Error("ZIP file and directory paths collide.");
	}
	return headers.map((entry) => {
		let output: Uint8Array;
		try {
			const compressed = bytes.subarray(entry.start, entry.stop);
			if (entry.compression === 0) output = compressed.slice();
			else {
				output = new Uint8Array(entry.expanded);
				let written = 0;
				const inflater = new Inflate((chunk) => {
					if (written + chunk.length > entry.expanded) throw new Error("Decompressed data exceeds its declared size.");
					output.set(chunk, written);
					written += chunk.length;
				});
				// Small input chunks bound allocation even when the declared size lies.
				for (let at = 0; at < compressed.length; at += 1024) inflater.push(compressed.subarray(at, at + 1024), at + 1024 >= compressed.length);
				if (written !== entry.expanded) throw new Error("Decompressed size differs from its header.");
			}
		} catch { throw new Error(`Could not decompress ZIP entry: ${entry.path}`); }
		if (output.length !== entry.expanded || crc32(output) !== entry.crc) throw new Error(`ZIP entry size or checksum is invalid: ${entry.path}`);
		return { path: entry.path, directory: entry.directory, bytes: output };
	});
}

export async function importSkillZip(bytes: Uint8Array, source: SkillSource): Promise<SkillPackage[]> {
	const entries = inspectZip(bytes).filter((entry) => !entry.directory);
	const roots = entries.filter((entry) => entry.path === "SKILL.md" || entry.path.endsWith("/SKILL.md")).map((entry) => entry.path.slice(0, -"SKILL.md".length));
	if (!roots.length) throw new Error("No SKILL.md found. Include a SKILL.md at the root of each skill folder.");
	if (roots.some((root) => roots.some((other) => root !== other && root.startsWith(other)))) throw new Error("Nested skill packages are ambiguous; import each skill separately.");
	const skills = roots.map((root) => parseSkillFiles(entries.filter((entry) => entry.path.startsWith(root)).map((entry) => bytesToSkillFile(entry.path.slice(root.length), entry.bytes)), source));
	const errors = validateSelection(skills).filter((issue) => issue.severity === "error");
	if (errors.length) throw new Error(errors.map((issue) => issue.message).join(" "));
	return skills;
}

/** Generate selected packages only. Imported scripts are bytes, never executable input. */
export async function generateSkillZip(skills: SkillPackage[], harness: HarnessAdapter): Promise<Uint8Array> {
	const errors = validateSelection(skills, harness).filter((issue) => issue.severity === "error");
	if (errors.length) throw new Error(errors.map((issue) => issue.message).join(" "));
	const compatibilityErrors = skills.flatMap((skill) => getCompatibilityIssues(skill, harness)).filter((issue) => issue.severity === "error");
	if (compatibilityErrors.length) throw new Error(compatibilityErrors.map((issue) => issue.message).join(" "));
	const files: Record<string, Uint8Array> = Object.create(null);
	for (const skill of skills) for (const file of skill.files) {
		const path = `${harness.skillRoot}/${skill.slug}/${file.path}`;
		const unsafe = validateArchivePath(path);
		if (unsafe) throw new Error(`Invalid export path: ${unsafe}`);
		files[path] = skillFileBytes(file);
	}
	const archive = zipSync(files, { level: 6 });
	if (archive.length > ARCHIVE_LIMITS.maxCompressedBytes) throw new Error("Generated ZIP exceeds the 10 MB archive limit. Export fewer skills.");
	return archive;
}
