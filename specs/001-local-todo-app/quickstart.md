# Quickstart: Local-First To-Do App

**Feature**: 001-local-todo-app | **Date**: 2026-06-09

Validation guide for proving the feature works end-to-end after implementation.
See [data-model.md](./data-model.md) and [contracts/](./contracts/) for details.

## Prerequisites

- Node.js 20+
- pnpm
- Modern browser (Chrome, Firefox, Safari, or Edge — latest two versions)

## Setup

```bash
# From repository root
pnpm install
pnpm dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## Automated Validation

Uses **vertical-slice TDD** during implementation (see `plan.md` § Test Strategy):
one behavior → one failing test → minimal code → repeat. Full suite must pass before
merge.

```bash
# Lint (Biome + Oxlint)
pnpm lint

# Unit + integration tests (Vitest)
pnpm test

# Full check (lint + test + build)
pnpm check
```

Expected: all commands exit 0 with no failures.

## Manual Validation Scenarios

### Scenario 1: Add and Persist (User Story 1 / P1)

1. Open app in browser (empty list).
2. Type `Buy milk` in add input → click **Add task**.
3. Confirm `Buy milk` appears in the list.
4. Add `Walk dog` and `Read book`.
5. Refresh the page.
6. **Expected**: All three tasks present in same order.

### Scenario 2: Empty Name Validation

1. Leave add input empty → click **Add task**.
2. **Expected**: Validation message; no new row added.
3. Enter only spaces → click **Add task**.
4. **Expected**: Same rejection behavior.

### Scenario 3: Complete Tasks (User Story 2 / P2)

1. Click task name on an active task.
2. **Expected**: Strikethrough applied.
3. Click the same name again.
4. **Expected**: Strikethrough removed (back to active).

### Scenario 4: Delete and Important (User Story 3 / P3)

1. Click green **!** button on a task.
2. **Expected**: Task name becomes bold blue.
3. Click **!** again → important styling removed.
4. Click red trash button → task removed.
5. Refresh page.
6. **Expected**: Deleted task does not return.

### Scenario 5: Search and Filter (User Story 4 / P4)

Setup: Create tasks — `Drink Coffee` (mark done), `Have a lunch` (mark important), `Build Awesome React App` (active).

1. **All filter** (default): all three visible.
2. Click **Active**: only `Have a lunch` and `Build Awesome React App` visible.
3. Click **Done**: only `Drink Coffee` (strikethrough) visible.
4. Select **All**, type `lunch` in search.
5. **Expected**: only `Have a lunch` visible.
6. Type `xyznonexistent`.
7. **Expected**: empty state message for no matches.

### Scenario 6: Header Counts

With 2 active and 1 done task (any filter):

- **Expected**: Header shows `2 more to do, 1 done` regardless of active filter.

### Scenario 7: UI Contract Spot Check

Compare running app against [contracts/ui-contract.md](./contracts/ui-contract.md):

- [ ] Title "To-Do List" top-left
- [ ] Status summary top-right
- [ ] Add form directly under header (above search/filters)
- [ ] Search placeholder "type to search task"
- [ ] Segmented All / Active / Done filters
- [ ] Add placeholder "type to add new task"
- [ ] "Add task" button with blue outline
- [ ] Delete (red) and Important (green) icon buttons per row

### Scenario 8: Persistence Error (optional manual)

1. Open DevTools → Application → IndexedDB.
2. Block or corrupt storage (browser-dependent).
3. Attempt to add a task.
4. **Expected**: Error banner shown; no silent failure.

## User Story Checkpoints

| Story | Independent test | Pass criteria |
|-------|------------------|---------------|
| P1 | Scenarios 1–2 | Add, view, persist |
| P2 | Scenario 3 | Toggle done with visual feedback |
| P3 | Scenario 4 | Delete + important toggle persist |
| P4 | Scenarios 5–6 | Filter, search, counts |

## Troubleshooting

| Issue | Check |
|-------|-------|
| Tasks not persisting | Browser IndexedDB not disabled; no private mode restrictions |
| Tests fail on IDB | Ensure `fake-indexeddb` configured in Vitest setup |
| Lint failures | Run `pnpm lint:fix` for Biome auto-fixes |
| Port in use | `pnpm dev -- --port 5174` |

## Next Steps

After all scenarios pass, proceed to `/speckit-tasks` to generate implementation tasks.
