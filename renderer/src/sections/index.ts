import type { LucideIcon } from "lucide-react";
import { ListChecks } from "lucide-react";
import type { ComponentType } from "react";
import { PlansPage } from "@/sections/plans";

export type Section = {
  // Its value in the URL's query.
  id: string;
  label: string;
  icon: LucideIcon;
  page: ComponentType;
};

// The first opens when the URL names no section or one that is gone.
export const sections: readonly [Section, ...Section[]] = [
  { id: "plans", label: "Plans", icon: ListChecks, page: PlansPage },
];
