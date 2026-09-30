import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "renderer",
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  server: { port: 5317, strictPort: true },
  build: { outDir: "../dist/renderer", emptyOutDir: true },
});
