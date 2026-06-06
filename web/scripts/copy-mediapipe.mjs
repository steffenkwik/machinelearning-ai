// Copies the MediaPipe tasks-vision wasm fileset from node_modules into
// public/mediapipe/wasm so the pose detector runs from our own origin (offline,
// no CDN). Runs before dev/build; the copied dir is gitignored.
import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const src = path.join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const dest = path.join(root, "public/mediapipe/wasm");

if (!existsSync(src)) {
  console.warn("[copy-mediapipe] source not found, skipping:", src);
  process.exit(0);
}

await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });
console.log("[copy-mediapipe] copied wasm fileset ->", dest);
