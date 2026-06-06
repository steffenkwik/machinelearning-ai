import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// The onnxruntime-web "/wasm" bundle build inlines its glue loader and lets the
// bundler resolve the .wasm asset URL, so the model runs fully offline with no
// CDN and no manual wasm copying. Only the ~13 MB single-threaded SIMD binary is
// emitted (well under Cloudflare Pages' 25 MiB per-file limit).
export default defineConfig({
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
