import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
// import { libInjectCss } from "vite-plugin-lib-inject-css";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ include: ["lib"] })],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      formats: ["es", "cjs"],
      name: "json-value-editor",
      fileName: (format) => (format === "cjs" ? "index.cjs" : "index.mjs"),
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
    },
    sourcemap: true,
  },
});
