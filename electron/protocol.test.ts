import { join } from "node:path";
import { expect, test } from "vitest";
import { fileFor } from "./protocol.ts";

const root = "/srv/page";

test("a path on the page maps to its file", () => {
  expect(fileFor(root, "grug://app/")).toBe(join(root, "index.html"));
  expect(fileFor(root, "grug://app/assets/index.js")).toBe(join(root, "assets/index.js"));
  expect(fileFor(root, "grug://app/a%20b.png")).toBe(join(root, "a b.png"));
  expect(fileFor(root, "grug://app/?plan=x#top")).toBe(join(root, "index.html"));
});

test("a path that climbs out of the page stays in it or gets no file", () => {
  expect(fileFor(root, "grug://app/../secret")).toBe(join(root, "secret"));
  expect(fileFor(root, "grug://app/%2e%2e/%2E%2E/secret")).toBe(join(root, "secret"));
  expect(fileFor(root, "grug://app/..%2fsecret")).toBeNull();
  expect(fileFor(root, "grug://app/%2e%2e%2f%2e%2e%2fetc%2fpasswd")).toBeNull();
  // /srv/page-other starts with /srv/page.
  expect(fileFor(root, "grug://app/..%2fpage-other/x")).toBeNull();
});

test("a request the protocol does not own gets no file", () => {
  expect(fileFor(root, "grug://other/index.html")).toBeNull();
  expect(fileFor(root, "file:///srv/page/index.html")).toBeNull();
  expect(fileFor(root, "grug://app/%E0%A4%A")).toBeNull();
});
