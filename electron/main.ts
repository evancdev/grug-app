import { app, BrowserWindow, dialog, nativeTheme, net, protocol } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { DEV_SERVER, devServerUp } from "./dev-server.ts";
import { fileFor, PAGE, SCHEME } from "./protocol.ts";

function serve(root: string) {
  protocol.handle(SCHEME, async (request) => {
    const file = fileFor(root, request.url);
    if (!file) return new Response(null, { status: 404 });
    try {
      return await net.fetch(pathToFileURL(file).href);
    } catch {
      return new Response(null, { status: 404 });
    }
  });
}

async function pageUrl(root: string) {
  if (!app.isPackaged && (await devServerUp(app.getAppPath()))) return DEV_SERVER;
  // loadURL resolves on the protocol's 404, so a missing build would be a
  // blank window with no error.
  const index = fileFor(root, PAGE);
  if (!index || !existsSync(index)) {
    throw new Error(`No built page in ${root}. Run npm run build.`);
  }
  return PAGE;
}

async function open() {
  const root = join(import.meta.dirname, "..", "renderer");
  serve(root);
  const url = await pageUrl(root);
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    title: "grug",
    // --background in index.css.
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0a0a0a" : "#ffffff",
  });
  await win.loadURL(url);
}

function aborted(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ERR_ABORTED";
}

// Standard lets the page's `/assets/...` paths resolve.
protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true } },
]);

// A top-level await of whenReady hangs in an ES module main.
app
  .whenReady()
  .then(open)
  .catch((error: unknown) => {
    // Vite reloading the page during the first load aborts it, and the window
    // still works.
    if (aborted(error)) return;
    dialog.showErrorBox("grug could not open its page", String(error));
    app.quit();
  });

app.on("window-all-closed", () => app.quit());
