import { expect, test } from "vitest";
import { followSystemTheme } from "@/theme";

test("the dark class follows the system setting", () => {
  const classes = new Set<string>();
  const root = {
    classList: {
      toggle: (token: string, force: boolean) =>
        force ? classes.add(token) : classes.delete(token),
    },
  };
  const listeners: (() => void)[] = [];
  const dark = {
    matches: true,
    addEventListener: (_: "change", listener: () => void) => listeners.push(listener),
  };

  followSystemTheme(root, dark);
  // Fails if the page opens light while the system is dark.
  expect(classes.has("dark")).toBe(true);

  dark.matches = false;
  for (const listener of listeners) listener();
  // Fails if switching the system to light leaves the page dark.
  expect(classes.has("dark")).toBe(false);
});
