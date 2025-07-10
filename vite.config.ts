import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  root: "./src/ui",
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    outDir: "../../dist",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
