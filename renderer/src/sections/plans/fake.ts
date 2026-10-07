import type {
  Milestone,
  MilestoneState,
  Plan,
  PlanCalls,
  PullRequest,
  Repo,
} from "@/sections/plans/data";

function milestone(
  number: number,
  title: string,
  state: MilestoneState,
  dependsOn: number[] = [],
  rest: Partial<Pick<Milestone, "waitingOn" | "landsOn">> = {},
): Milestone {
  return { number, title, state, dependsOn, waitingOn: [], landsOn: null, ...rest };
}

function master(plan: Omit<Plan, "files">) {
  const open = plan.milestones.filter((m) => m.state === "open").map((m) => m.number);
  const milestones = plan.milestones.map((m) =>
    [
      `### ${m.number}. ${m.title}${m.state === "done" ? " (done)" : ""}`,
      `- Depends on: ${[...m.dependsOn, ...m.waitingOn].join(", ") || "nothing"}`,
      ...(m.landsOn ? [`- Lands on: ${m.landsOn}`] : []),
    ].join("\n"),
  );
  return [
    "---",
    `plan: ${plan.name}`,
    `status: ${plan.status}`,
    `milestone: ${open.join(", ")}`,
    `branch: ${plan.branch ?? ""}`,
    `pr: ${plan.prs.map((pr) => pr.number).join(", ")}`,
    "---",
    "",
    `# ${plan.name}`,
    "",
    "## Milestones",
    "",
    milestones.join("\n\n") || "Not written yet.",
    "",
  ].join("\n");
}

function fakePlan(plan: Omit<Plan, "files">, files: Record<string, string> = {}) {
  const texts = new Map([["master.md", master(plan)], ...Object.entries(files)]);
  return { plan: { ...plan, files: [...texts.keys()] }, texts };
}

function pr(repo: string, fields: Omit<PullRequest, "url">): PullRequest {
  return { ...fields, url: `https://example.com/${repo}/pull/${fields.number}` };
}

const plan3 = `# Milestone 3. Rank the results

## Goal

Results come back **best first**, scored by where the words matched. Today they
come back in index order, so the doc a reader wants is often on page *three*.

> The parser from milestone 2 already splits a query into \`terms\`. This
> milestone only orders what it finds.

## Where things stand

- The index from milestone 1 holds every doc's title, headings and body.
- Nothing scores a match yet.
  - The page sorts by \`indexedAt\`.
  - The API returns the same order.

## Steps

1. Score each doc by field, with the weights below.
2. Sort by score, newest first on a tie.
3. Cut the list at 50.

## Weights

| Field   | Weight | Why                                      |
| ------- | -----: | ---------------------------------------- |
| title   |      3 | A match in the title is usually the doc. |
| heading |      2 | Headings name the parts of a doc.        |
| body    |      1 | Everything else.                         |

## Scoring

\`\`\`ts
export function score(doc: Doc, terms: string[]) {
  return terms.reduce((total, term) => total + WEIGHTS[fieldOf(doc, term)], 0);
}
\`\`\`

## Where ranking sits

\`\`\`mermaid
flowchart LR
  query["Query"] --> parse["Parse · 2"]
  parse --> rank["Rank · 3"]
  rank --> page["Results page · 4"]
\`\`\`

The weights follow [the ranking notes](https://example.com/ranking-notes). The
first draft is in [the old notes](file:///tmp/old-ranking-notes.md), which the
page should refuse to open.
`;

const plan4 = `# Milestone 4. Draw the results page

## Goal

One list of results under the search box, each with its title and the line
that matched.
`;

const findings = `## Milestone 1

The index builds in 4 seconds on the fake corpus.

\`\`\`
$ npm run index
indexed 1,204 docs in 4.1s
exit 0
\`\`\`

## Milestone 2

- Quoted phrases parse as one term.
- A lone \`-\` parses as nothing, not as an empty exclusion.
`;

const changelog = `- 2026-01-12: milestone 2 closed. Quoted phrases count as one term.
- 2026-01-08: milestone 1 closed. Indexing runs nightly.
- 2026-01-05: plan written, seven milestones.
`;

const diagram = `# search-rewrite

## Milestones

Green is done, blue is running now, yellow can start now, grey waits on other
milestones, and red waits on something outside the plan.

\`\`\`mermaid
flowchart TD
  m1["1. Index the docs"]:::done
  m2["2. Parse the query"]:::done
  m3["3. Rank the results"]:::open
  m4["4. Draw the results page"]:::open
  m5["5. Suggest as you type"]:::ready
  m6["6. Highlight the matches"]:::blocked
  m7["7. Drop the old index"]:::waiting
  x1{{"Billing stops reading the old index"}}:::outside
  m1 --> m2
  m1 --> m3
  m2 --> m3
  m2 --> m4
  m2 --> m5
  m3 --> m6
  m4 --> m6
  m1 --> m7
  x1 -.-> m7
  classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef open fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,stroke-width:3px
  classDef ready fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef blocked fill:#f3f4f6,stroke:#9ca3af,color:#374151
  classDef waiting fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
  classDef outside fill:#ffffff,stroke:#dc2626,color:#7f1d1d,stroke-dasharray:4 3
\`\`\`
`;

const fakes = [
  {
    id: "-Users-dev-code-lantern",
    name: "~/code/lantern",
    plans: [
      fakePlan(
        {
          name: "search-rewrite",
          status: "active",
          branch: "search-rewrite",
          prs: [
            pr("lantern", {
              number: 142,
              title: "Rewrite search",
              state: "draft",
              branch: "search-rewrite",
            }),
          ],
          milestones: [
            milestone(1, "Index the docs", "done"),
            milestone(2, "Parse the query", "done", [1]),
            milestone(3, "Rank the results", "open", [1, 2]),
            milestone(4, "Draw the results page", "open", [2]),
            milestone(5, "Suggest as you type", "ready", [2]),
            milestone(6, "Highlight the matches", "blocked", [3, 4]),
            milestone(7, "Drop the old index", "waiting", [1], {
              waitingOn: ["Billing stops reading the old index"],
            }),
          ],
        },
        {
          "plan3.md": plan3,
          "plan4.md": plan4,
          "findings.md": findings,
          "changelog.md": changelog,
          "diagram.md": diagram,
        },
      ),
      fakePlan({
        name: "dark-mode",
        status: "reviewing",
        branch: "dark-mode",
        prs: [
          pr("lantern", {
            number: 138,
            title: "Add a dark theme",
            state: "open",
            branch: "dark-mode",
          }),
        ],
        milestones: [
          milestone(1, "Pick the colors", "done"),
          milestone(2, "Follow the system setting", "done", [1]),
        ],
      }),
      fakePlan(
        {
          name: "csv-export",
          status: "archived",
          branch: "csv-export",
          prs: [
            pr("lantern", {
              number: 97,
              title: "Export results as CSV",
              state: "merged",
              branch: "csv-export",
            }),
          ],
          milestones: [milestone(1, "Write the CSV", "done")],
        },
        { "findings.md": "## Milestone 1\n\nExcel opens the file only with a byte-order mark.\n" },
      ),
      fakePlan({
        name: "offline-sync",
        status: "planning",
        branch: null,
        prs: [],
        milestones: [],
      }),
    ],
  },
  {
    id: "-Users-dev-code-kettle",
    name: "~/code/kettle",
    plans: [
      fakePlan({
        name: "cli-flags",
        status: "active",
        branch: "cli-flags",
        prs: [],
        milestones: [
          milestone(1, "Parse the flags", "open"),
          milestone(2, "Write the help text", "blocked", [1]),
        ],
      }),
      fakePlan({
        name: "token-refresh",
        status: "reviewing",
        branch: "token-refresh",
        prs: [
          pr("kettle", {
            number: 61,
            title: "Refresh tokens before they expire",
            state: "merged",
            branch: "token-refresh",
          }),
          pr("kettle", {
            number: 64,
            title: "Remove the old token cache",
            state: "merged",
            branch: "token-cache-removal",
          }),
        ],
        milestones: [
          milestone(1, "Refresh before expiry", "done"),
          milestone(2, "Remove the old cache", "done", [1], { landsOn: "token-cache-removal" }),
        ],
      }),
      fakePlan(
        {
          name: "retry-queue",
          status: "abandoned",
          branch: "retry-queue",
          prs: [
            pr("kettle", {
              number: 58,
              title: "Retry failed jobs from a queue",
              state: "closed",
              branch: "retry-queue",
            }),
          ],
          milestones: [
            milestone(1, "Store failed jobs", "done"),
            milestone(2, "Retry them on a timer", "ready", [1]),
          ],
        },
        { "findings.md": "## Abandoned\n\nThe job runner gained retries of its own.\n" },
      ),
    ],
  },
  { id: "-Users-dev-code-notebook", name: "~/code/notebook", plans: [] },
];

export const fakeRepos: Repo[] = fakes.map((repo) => ({
  ...repo,
  plans: repo.plans.map((fake) => fake.plan),
}));

function find(repoId: string, planName: string) {
  return fakes
    .find((repo) => repo.id === repoId)
    ?.plans.find((fake) => fake.plan.name === planName);
}

// Copies, as IPC gives the page, so changing an answer can't change the fakes.
export const fakePlanCalls: PlanCalls = {
  listPlans: async () => structuredClone(fakeRepos),
  getPlan: async (repoId, planName) => structuredClone(find(repoId, planName)?.plan ?? null),
  getPlanFile: async (repoId, planName, fileName) => {
    const markdown = find(repoId, planName)?.texts.get(fileName);
    return markdown === undefined ? null : { name: fileName, markdown };
  },
};

const hang = () => new Promise<never>(() => {});

export function applyUrlSetting(calls: PlanCalls, search: string): PlanCalls {
  const setting = new URLSearchParams(search).get("calls");
  if (setting === "hang") return { listPlans: hang, getPlan: hang, getPlanFile: hang };
  if (setting === "empty") {
    return { listPlans: async () => [], getPlan: async () => null, getPlanFile: async () => null };
  }
  if (setting === "error") {
    const fail = async () => ({ error: "Failed on purpose: the page's URL has ?calls=error." });
    return { listPlans: fail, getPlan: fail, getPlanFile: fail };
  }
  return calls;
}
