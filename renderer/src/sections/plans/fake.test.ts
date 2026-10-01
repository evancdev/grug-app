import { describe, expect, test } from "vitest";
import {
  isFailed,
  MILESTONE_STATES,
  PLAN_STATUSES,
  PR_STATES,
  type PlanCalls,
  type PlanFile,
  type Result,
} from "@/sections/plans/data";
import { applyUrlSetting, fakePlanCalls, fakeRepos } from "@/sections/plans/fake";

const plans = fakeRepos.flatMap((repo) => repo.plans);

function missing(wanted: readonly string[], found: string[]) {
  return wanted.filter((value) => !found.includes(value));
}

function shortest(lists: string[][]) {
  return lists.reduce((a, b) => (b.length < a.length ? b : a));
}

async function openEveryFile() {
  const opened: { name: string; file: Result<PlanFile | null> }[] = [];
  for (const repo of fakeRepos) {
    for (const plan of repo.plans) {
      for (const name of plan.files) {
        opened.push({ name, file: await fakePlanCalls.getPlanFile(repo.id, plan.name, name) });
      }
    }
  }
  return opened;
}

test("a fake plan has every plan status", () => {
  expect(
    missing(
      PLAN_STATUSES,
      plans.map((plan) => plan.status),
    ),
  ).toEqual([]);
});

test("a fake milestone has every milestone state", () => {
  const states = plans.flatMap((plan) => plan.milestones.map((milestone) => milestone.state));
  expect(missing(MILESTONE_STATES, states)).toEqual([]);
});

test("a fake PR has every PR state", () => {
  expect(
    missing(
      PR_STATES,
      plans.flatMap((plan) => plan.prs.map((pr) => pr.state)),
    ),
  ).toEqual([]);
});

test("a fake repo has no plans", () => {
  expect(fakeRepos.map((repo) => repo.plans.length)).toContain(0);
});

test("a fake repo has several plans", () => {
  expect(Math.max(...fakeRepos.map((repo) => repo.plans.length))).toBeGreaterThan(1);
});

test("a fake plan's PRs have all merged", () => {
  const merged = plans.filter(
    (plan) => plan.prs.length && plan.prs.every((pr) => pr.state === "merged"),
  );
  expect(merged).not.toEqual([]);
});

test("a fake plan has a branch with no PR", () => {
  const bare = plans.filter(
    (plan) => plan.branch && !plan.prs.some((pr) => pr.branch === plan.branch),
  );
  expect(bare).not.toEqual([]);
});

test("a fake plan has every kind of plan file", () => {
  const kinds = ["master.md", "diagram.md", "planN.md", "findings.md", "changelog.md"];
  const lacking = plans.map((plan) =>
    missing(
      kinds,
      plan.files.map((name) => name.replace(/^plan\d+\.md$/, "planN.md")),
    ),
  );
  expect(shortest(lacking)).toEqual([]);
});

test("every file a fake plan lists opens", async () => {
  for (const { name, file } of await openEveryFile()) {
    expect(file, name).toEqual({ name, markdown: expect.any(String) });
  }
});

test("a fake file has everything the file view draws", async () => {
  const kinds = {
    heading: /^#{1,6} /m,
    list: /^\s*(-|\d+\.) /m,
    table: /^\|( *:?-+:? *\|)+$/m,
    code: /^```(?!mermaid)\w+$/m,
    mermaid: /^```mermaid$/m,
    "https link": /\]\(https:\/\//,
    "link with another scheme": /\]\((?!https?:)[a-z][\w+.-]*:/,
  };
  const lacking = (await openEveryFile()).map(({ file }) => {
    const text = !file || isFailed(file) ? "" : file.markdown;
    return Object.entries(kinds)
      .filter(([, pattern]) => !pattern.test(text))
      .map(([kind]) => kind);
  });
  expect(shortest(lacking)).toEqual([]);
});

test("a plan or file that doesn't exist answers null", async () => {
  const [repo] = fakeRepos;
  const [plan] = repo.plans;
  expect(await fakePlanCalls.getPlan("no-such-repo", plan.name)).toBeNull();
  expect(await fakePlanCalls.getPlan(repo.id, "no-such-plan")).toBeNull();
  expect(await fakePlanCalls.getPlanFile(repo.id, "no-such-plan", "master.md")).toBeNull();
  // A name off Object's prototype, which a plain object lookup would find.
  expect(await fakePlanCalls.getPlanFile(repo.id, plan.name, "constructor")).toBeNull();
});

test("each answer is a copy", async () => {
  // IPC never answers two calls with the same object.
  expect(await fakePlanCalls.listPlans()).not.toBe(await fakePlanCalls.listPlans());
});

test("isFailed tells an error object from an answer", () => {
  expect(isFailed({ error: "no such plan" })).toBe(true);
  // null is the answer for a plan that isn't there.
  expect(isFailed(null)).toBe(false);
  expect(isFailed([])).toBe(false);
});

test("an unknown ?calls= value leaves the calls alone", () => {
  expect(applyUrlSetting(fakePlanCalls, "?calls=slow")).toBe(fakePlanCalls);
});

const [repo] = fakeRepos;
const [plan] = repo.plans;
const [file] = plan.files;

// Keyed by call, so a call added to PlanCalls without a case fails the typecheck.
const cases: Record<
  keyof PlanCalls,
  { call: (calls: PlanCalls) => Promise<unknown>; empty: unknown; answer: unknown }
> = {
  listPlans: { call: (calls) => calls.listPlans(), empty: [], answer: fakeRepos },
  getPlan: { call: (calls) => calls.getPlan(repo.id, plan.name), empty: null, answer: plan },
  getPlanFile: {
    call: (calls) => calls.getPlanFile(repo.id, plan.name, file),
    empty: null,
    answer: { name: file, markdown: expect.stringContaining(`plan: ${plan.name}`) },
  },
};

describe.each(Object.entries(cases))("%s", (_, { call, empty, answer }) => {
  test("answers from the fake plans with no setting", async () => {
    expect(await call(applyUrlSetting(fakePlanCalls, ""))).toEqual(answer);
  });

  test("never answers with ?calls=hang", async () => {
    const timer = new Promise((resolve) => setTimeout(resolve, 20, "timer"));
    expect(await Promise.race([call(applyUrlSetting(fakePlanCalls, "?calls=hang")), timer])).toBe(
      "timer",
    );
  });

  test("answers with nothing with ?calls=empty", async () => {
    expect(await call(applyUrlSetting(fakePlanCalls, "?calls=empty"))).toEqual(empty);
  });

  test("answers with an error object with ?calls=error", async () => {
    expect(await call(applyUrlSetting(fakePlanCalls, "?calls=error"))).toEqual({
      error: expect.any(String),
    });
  });
});
