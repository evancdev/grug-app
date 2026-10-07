import { expect, test } from "vitest";
import { checkoutHeaders, servesCheckout } from "./dev-server.ts";

test("only the dev server of grug's own checkout counts", () => {
  const headers = new Headers(checkoutHeaders("/src/grug"));
  expect(servesCheckout(headers, "/src/grug")).toBe(true);
  expect(servesCheckout(headers, "/src/grug-other")).toBe(false);
  expect(servesCheckout(new Headers(), "/src/grug")).toBe(false);
});

test("a checkout whose folder name a header can't carry still counts", () => {
  const headers = new Headers(checkoutHeaders("/src/草/grug"));
  expect(servesCheckout(headers, "/src/草/grug")).toBe(true);
});
