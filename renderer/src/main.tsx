import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import "@/index.css";
import { followSystemTheme } from "@/theme";

followSystemTheme(document.documentElement, matchMedia("(prefers-color-scheme: dark)"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
