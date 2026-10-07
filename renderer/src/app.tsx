import { useSyncExternalStore } from "react";
import { openSection } from "@/open-section";
import { sections } from "@/sections";
import { Sidebar } from "@/sidebar";

const store = openSection(sections, window);

export function App() {
  const open = useSyncExternalStore(store.subscribe, store.current);
  return (
    <div className="flex h-screen gap-3 p-3">
      <Sidebar sections={sections} open={open} onOpen={store.open} />
      <main className="flex min-w-0 flex-1 flex-col border-2 border-ink bg-card text-card-foreground">
        <header className="border-b-2 border-ink px-5 pt-3 pb-2">
          <h1 className="font-heading text-4xl leading-none">{open.label}</h1>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          <open.page />
        </div>
      </main>
    </div>
  );
}
