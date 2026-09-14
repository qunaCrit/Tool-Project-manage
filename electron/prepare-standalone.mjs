import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  throw new Error("Next.js standalone output not found. Run `npm run build` first.");
}

const standaloneNextDir = path.join(standaloneDir, ".next");
mkdirSync(standaloneNextDir, { recursive: true });

const staticDir = path.join(rootDir, ".next", "static");
if (existsSync(staticDir)) {
  cpSync(staticDir, path.join(standaloneNextDir, "static"), { recursive: true });
}

const publicDir = path.join(rootDir, "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, path.join(standaloneDir, "public"), { recursive: true });
}
