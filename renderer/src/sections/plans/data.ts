export const PLAN_STATUSES = ["planning", "active", "reviewing", "archived", "abandoned"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

// `blocked` waits on another milestone in the plan, `waiting` on something
// outside it, like a PR merging.
export const MILESTONE_STATES = ["done", "open", "ready", "blocked", "waiting"] as const;
export type MilestoneState = (typeof MILESTONE_STATES)[number];

export const PR_STATES = ["draft", "open", "merged", "closed"] as const;
export type PrState = (typeof PR_STATES)[number];

export type Milestone = {
  number: number;
  title: string;
  state: MilestoneState;
  dependsOn: number[];
  waitingOn: string[];
  // null when it lands on the plan's own branch.
  landsOn: string | null;
};

export type PullRequest = {
  number: number;
  title: string;
  url: string;
  state: PrState;
  branch: string;
};

export type Plan = {
  name: string;
  status: PlanStatus;
  branch: string | null;
  // In the order they were opened.
  prs: PullRequest[];
  milestones: Milestone[];
  // master.md, then the milestone files by number, the logs, and the rest.
  files: string[];
};

// markdown is the whole file, frontmatter included.
export type PlanFile = { name: string; markdown: string };

export type Repo = {
  // The repo's folder under ~/.claude/projects/.
  id: string;
  name: string;
  plans: Plan[];
};

export type Failed = { error: string };

export type Result<T> = T | Failed;

export function isFailed<T>(result: Result<T>): result is Failed {
  return typeof result === "object" && result !== null && "error" in result;
}

export type PlanCalls = {
  listPlans: () => Promise<Result<Repo[]>>;
  getPlan: (repoId: string, planName: string) => Promise<Result<Plan | null>>;
  getPlanFile: (
    repoId: string,
    planName: string,
    fileName: string,
  ) => Promise<Result<PlanFile | null>>;
};
