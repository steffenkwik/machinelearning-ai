import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Relative base so the build works whether deployed at a domain root or a
// subpath on Cloudflare Pages. The ONNX runtime WASM is bundled by Vite via
// the `?url` imports in the inference worker — no CDN, fully offline.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 2000,
  },
});
