# grug

A macOS desktop app with one window. The sidebar lists sections, and the rest
of the window shows the open one. Agents maintain grug and pick it up cold each
session, so the conventions live here. A change that adds a convention or
breaks one updates this file in the same pull request.

## Sections

Each sidebar section gets its own folder, holding its page, the parts only it
uses, and its hooks. Code moves to a shared folder once a second section needs
it, not before.

## Calls from the page to the main process

- The page reaches the main process only through one named list of calls. The
  preload is typed against that list, so a call missing from the preload fails
  the typecheck.
- A call returns its result or an error object with the message, and never
  throws. The page then shows the real error instead of Electron's wrapper
  around it.
- The page sends the arguments, so a call checks their shape before using them.

## Imports

Code under `renderer/src/` imports another module there by `@/`, as in
`@/app`, not `../app`. The alias is `paths` in `tsconfig.json`, which Vite and
Vitest both read, so it is defined nowhere else.

## Reuse

Before writing a component, hook, or helper, search for one that does the job.
When two places repeat the same logic, move it into one function in the same
change instead of leaving the second copy for later.

## Public repo

This repo is public, so nothing in it describes the machine it runs on or the
person who uses it. That means no usernames or home folder paths, and no real
repo, plan, container, database, table or host names, ports, or passwords, in
code, tests, comments, docs, or commit messages. Tests and examples use made-up
values. Places every install has are fine, like `~/Applications/grug.app` or
`~/.claude/projects/`.

Before handing back a diff, search its added lines for the real names you saw
while working, like the containers `docker ps` listed:

```
git diff | grep '^+' | grep -iE 'name1|name2'
```

A made-up value that happens to match a real one, like a port, gets changed
too.

## Tests

Keep logic that doesn't touch the disk, a process, or the network in its own
exported function, and test it in a `*.test.ts` beside the module. A comment on
each assertion says what it fails on.

Before handing back a diff, run `npm run lint`, `npm run format:check`,
`npm run typecheck`, `npm test` and `npm run build`. `npm run format` fixes
what `format:check` finds. A diff under `.github/` also runs
`uvx zizmor .github/`.

CI, in `.github/workflows/ci.yml`, runs those five npm scripts and zizmor on
every pull request, and main accepts a merge only once its `all-green` check
passes. A new check goes in as an npm script and an entry in CI's list of
scripts, never as a tool called from the workflow directly.

## Comments

Write a comment only for what the code can't say:

- Why it's done this way, when the obvious way would break. `// Saved after
  scrolling stops, since the browser limits how often a page can rewrite its
  history entry.`
- A trap for whoever edits it next. `// An app opened from Finder gets a PATH
  without Homebrew or OrbStack on it.`
- What a value holds when its type doesn't say. `// key is the column's place
  in the primary key, 0 when it isn't in it.`

Don't write one that says what the next line does, that repeats the name of the
function or component under it, or that tells the story of the change, like
"moved from pages.tsx". The story goes in the commit message.

Before handing back a diff, list the comments it adds and delete any that fail
the above:

```
git diff | grep -E '^\+\s*(//|\{/\*)'
```

A new file shows up there only after `git add -N <file>`.
