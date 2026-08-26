import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const entry = (path: string) => new URL(path, import.meta.url).pathname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": entry("./src"),
    },
  },
  build: {
    rollupOptions: {
      // Each legal page is its own entry so it ships as a real static file at
      // a clean URL — GitHub Pages serves /privacy/ with no SPA fallback hack.
      input: {
        main: entry("./index.html"),
        privacy: entry("./privacy/index.html"),
        terms: entry("./terms/index.html"),
      },
    },
  },
});
