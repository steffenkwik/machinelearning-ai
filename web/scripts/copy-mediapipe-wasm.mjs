// Copies the MediaPipe tasks-vision WASM runtime from node_modules into
// public/mediapipe/wasm so it ships with the static build (no CDN, works
// offline). The copied files are gitignored; only the small pose model is
// committed. Runs automatically via the `prebuild`/`predev` npm hooks.
import { cp, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const dest = path.join(root, "public", "mediapipe", "wasm");

if (!existsSync(src)) {
  console.error("[copy-mediapipe-wasm] source not found:", src);
  process.exit(1);
}
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });
const files = await readdir(dest);
console.log(`[copy-mediapipe-wasm] copied ${files.length} files -> public/mediapipe/wasm`);
