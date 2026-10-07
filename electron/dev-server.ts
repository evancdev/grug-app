export const DEV_PORT = 5317;
export const DEV_SERVER = `http://localhost:${DEV_PORT}/`;

// Every checkout's dev server takes the same port, so each one names its
// checkout in a header.
const CHECKOUT_HEADER = "x-grug-checkout";

export function checkoutHeaders(checkout: string) {
  return { [CHECKOUT_HEADER]: encodeURIComponent(checkout) };
}

export function servesCheckout(headers: Headers, checkout: string) {
  return headers.get(CHECKOUT_HEADER) === checkoutHeaders(checkout)[CHECKOUT_HEADER];
}

export async function devServerUp(checkout: string) {
  try {
    const res = await fetch(DEV_SERVER, { method: "HEAD", signal: AbortSignal.timeout(1000) });
    return servesCheckout(res.headers, checkout);
  } catch {
    return false;
  }
}
