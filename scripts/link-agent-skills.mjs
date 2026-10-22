
/**
 * Optional local native skill discovery. The single checked-in source stays .agents/skills.
 * Never overwrite an existing file or manually installed skill directory.
 */
import { lstat, mkdir, realpath, symlink } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, ".agents/skills");
const targets = [".claude/skills", ".cursor/skills", ".github/skills", ".gemini/skills"];

for (const path of targets) {
  const destination = resolve(root, path);
  await mkdir(dirname(destination), { recursive: true });
  try {
    await lstat(destination);
    const actual = await realpath(destination);
    if (actual === await realpath(source)) {
      console.log("Already linked: " + path);
    } else {
      console.warn("Preserving existing path (manual setup required): " + path);
    }
    continue;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  try {
    await symlink(process.platform === "win32" ? source : relative(dirname(destination), source), destination, process.platform === "win32" ? "junction" : "dir");
    console.log("Linked: " + path + " -> .agents/skills");
  } catch (error) {
    console.warn("Could not link " + path + ": " + error.message + ". Read .agents/skills explicitly.");
  }
}
