/**
 * Dropbox/iCloud/OneDrive sync the project's `.next` directory while Next is mid-build, racing to
 * move or replace webpack chunks and producing errors like "Cannot find module './102.js'".
 *
 * The fix that keeps module resolution intact (a symlink out of the repo breaks it — Next resolves
 * deps from the link target, away from node_modules) is Dropbox's own ignore mechanism: set the
 * `com.dropbox.ignored` extended attribute on the heavy, fast-changing build dirs. They stay
 * physically in the repo but Dropbox never syncs them, so there's no race.
 *
 * macOS + Dropbox-specific; a harmless no-op elsewhere. Skipped in CI. Wired via predev/prebuild.
 * Docs: https://help.dropbox.com/sync/ignored-files
 */
import { join } from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

if (process.env.CI || process.platform !== "darwin") {
  process.exit(0);
}

const targets = [".next", "out", "node_modules"];

for (const name of targets) {
  const p = join(process.cwd(), name);

  // Clean up the old symlink approach if it's still around.
  try {
    if (fs.lstatSync(p).isSymbolicLink()) fs.rmSync(p);
  } catch {
    /* doesn't exist yet */
  }

  // The build dirs must exist for the attribute to stick; node_modules already does.
  if (name !== "node_modules" && !fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
  if (!fs.existsSync(p)) continue;

  try {
    execFileSync("xattr", ["-w", "com.dropbox.ignored", "1", p], { stdio: "ignore" });
  } catch {
    /* xattr unavailable or not a Dropbox folder — fine */
  }
}

console.log("✓ Marked .next / out / node_modules as Dropbox-ignored (avoids build-sync corruption).");
