import { resolve, sep } from "node:path";

export const SCHEME = "grug";
const HOST = "app";
export const PAGE = `${SCHEME}://${HOST}/`;

export function fileFor(root: string, url: string): string | null {
  const parsed = URL.parse(url);
  if (parsed?.protocol !== `${SCHEME}:` || parsed.host !== HOST) return null;
  let path: string;
  try {
    // The URL parser drops `..` and `%2e%2e` but not `..%2f`, which decoding
    // turns into a `../` the check below has to catch.
    path = decodeURIComponent(parsed.pathname);
  } catch {
    return null;
  }
  if (path.endsWith("/")) path += "index.html";
  const base = resolve(root);
  const file = resolve(base, `.${path}`);
  return file.startsWith(base + sep) ? file : null;
}
