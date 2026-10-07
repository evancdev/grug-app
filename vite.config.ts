import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { checkoutHeaders, DEV_PORT } from "./electron/dev-server.ts";

export default defineConfig({
  root: "renderer",
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  server: { port: DEV_PORT, strictPort: true, headers: checkoutHeaders(import.meta.dirname) },
  build: { outDir: "../dist/renderer", emptyOutDir: true },
  // A repo-wide glob would also run every checkout under .worktrees/.
  test: {
    dir: import.meta.dirname,
    include: ["renderer/src/**/*.test.{ts,tsx}", "electron/**/*.test.ts"],
  },
});
