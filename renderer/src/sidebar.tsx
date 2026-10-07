import { Button } from "@/components/ui/button";
import type { Section } from "@/sections";

export function Sidebar({
  sections,
  open,
  onOpen,
}: {
  sections: readonly Section[];
  open: Section;
  onOpen: (section: Section) => void;
}) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-2 border-ink bg-sidebar text-sidebar-foreground">
      <div className="bg-ink px-4 pt-2 pb-5 text-sidebar [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_1.25rem),0_100%)]">
        <span className="font-heading text-5xl leading-none">grug</span>
      </div>
      <nav className="flex flex-col gap-1.5 p-3">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={section === open ? "default" : "ghost"}
            size="sm"
            className="justify-start text-[13px]"
            aria-current={section === open ? "page" : undefined}
            onClick={() => onOpen(section)}
          >
            <section.icon />
            {section.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
