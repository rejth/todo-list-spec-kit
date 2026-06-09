---
description: "Task list for Local-First To-Do App implementation"
---

# Tasks: Local-First To-Do App

**Input**: Design documents from `/specs/001-local-todo-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Granularity**: **7 tasks** — one per phase. Each phase maps to **one GitHub issue**.
Sub-items below are an in-phase checklist, not separate issues.

**Tests**: Constitution Principle III + **vertical-slice TDD** (see `plan.md` § Test Strategy).
Within each phase, work one behavior at a time: RED → GREEN → repeat.

## Format

```text
- [ ] T00N Phase title — description (issue #N)
```

Each top-level phase line MUST include `(issue #N)` for `/speckit-git-workflow` PR linking.

Sub-checklists use `- [ ]` without task IDs.

## Path Conventions

Single project at repository root: `src/`, `tests/`

---

- [x] T001 **Phase 1: Setup** — Initialize Vite + Solid + TypeScript with pnpm and quality tooling (issue #1)

  **Deliverables**: Runnable dev server; empty test suite passes; directory scaffold; base CSS tokens.

  **Checkpoint**: `pnpm install && pnpm dev` starts; `pnpm test` passes.

  - [x] Create Vite + Solid + TypeScript project; scripts: `dev`, `build`, `test`, `lint`, `check` in `package.json`
  - [x] Add `tiny-idb-store@^0.1.2` via `pnpm add tiny-idb-store`
  - [x] Configure Vitest + `fake-indexeddb` in `vitest.config.ts`, `tests/setup.ts`
  - [x] Configure Biome in `biome.json`
  - [x] Configure Oxlint in `.oxlintrc.json`
  - [x] Configure Lefthook in `lefthook.yml` (pre-commit: `pnpm lint`, `pnpm test`)
  - [x] Create scaffold: `src/components/`, `src/stores/`, `src/lib/storage/`, `src/types/`, `tests/unit/`, `tests/integration/`
  - [x] Add design tokens and base layout in `src/index.css` per `contracts/ui-contract.md`

---

- [x] T002 **Phase 2: Foundational — Storage** — IndexedDB layer + app shell (vertical TDD) (issue #2)

  **Deliverables**: `TasksStore` CRUD tested; `StorageService` lifecycle; store skeleton; app mounts.

  **Checkpoint**: All `tests/unit/TasksStore.test.ts` GREEN; app shows loading until IDB ready.

  **TDD cycles** (sequential — finish each GREEN before next RED):

  - [x] Define types in `src/types/task.ts` per `data-model.md`
  - [x] RED→GREEN: `"add makes task retrievable by id"` → `TasksStore`, `StorageService` in `src/lib/storage/`
  - [x] RED→GREEN: `"getAll returns stored tasks"` → `TasksStore.getAll`
  - [x] RED→GREEN: `"update patches task fields"` → `TasksStore.update`
  - [x] RED→GREEN: `"delete removes task from getAll"` → `TasksStore.delete`
  - [x] Store skeleton: `initTaskStore()`, `tasks`, `persistenceError` in `src/stores/taskStore.ts`
  - [x] `getStatusSummary()` in `src/lib/filters.ts`
  - [x] Entry `src/index.tsx` + minimal `src/components/App.tsx` with `onMount` init

---

- [x] T003 **Phase 3: User Story 1 — Add and View Tasks (P1)** 🎯 MVP (issue #3)

  **Goal**: Add tasks, flat list, persist across refresh.

  **Independent test**: Quickstart Scenarios 1–2.

  **Checkpoint**: MVP demo-ready.

  **TDD cycles** (store — sequential):

  - [x] RED→GREEN: `"addTask makes task appear in tasks list"` → `addTask` in `src/stores/taskStore.ts`
  - [x] RED→GREEN: `"addTask rejects empty or whitespace-only name"`
  - [x] RED→GREEN: `"addTask trims leading and trailing whitespace"`
  - [x] RED→GREEN: `"duplicate names create distinct tasks"`
  - [x] RED→GREEN: `"initTaskStore restores tasks after StorageService re-create"` in `tests/integration/persistence.test.ts`
  - [x] RED→GREEN: `"persistence failure sets persistenceError"`

  **UI** (after store cycles GREEN):

  - [x] `Header.tsx` — title + `{active} more to do, {done} done`
  - [x] `AddTaskForm.tsx` — placeholder "type to add new task", validation
  - [x] `TaskList.tsx`, `TaskItem.tsx` (name only), `ErrorBanner.tsx`
  - [x] Wire `App.tsx`: Header → AddTaskForm → TaskList + ErrorBanner per ui-contract

---

- [x] T004 **Phase 4: User Story 2 — Complete Tasks (P2)** (issue #5)

  **Goal**: Click name toggles done; strikethrough styling.

  **Independent test**: Quickstart Scenario 3.

  **TDD cycles**:

  - [x] RED→GREEN: `"toggleDone flips done flag and persists"`
  - [x] RED→GREEN: `"toggleDone affects only the targeted task"`

  **UI**:

  - [x] Clickable task name → `toggleDone` in `TaskItem.tsx`
  - [x] Strikethrough styling in `TaskItem.tsx`, `src/index.css`

---

- [x] T005 **Phase 5: User Story 3 — Delete and Mark Important (P3)** (issue #4)

  **Goal**: Delete persists; important toggle with bold blue styling.

  **Independent test**: Quickstart Scenario 4.

  **TDD cycles**:

  - [x] RED→GREEN: `"deleteTask removes task and persists"`
  - [x] RED→GREEN: `"toggleImportant flips flag and persists"`

  **UI**:

  - [x] Delete button (red trash SVG) + Mark Important button (green ! SVG) in `TaskItem.tsx`
  - [x] Important + done+important styles in `TaskItem.tsx`, `src/index.css`

---

- [ ] T006 **Phase 6: User Story 4 — Search and Filter (P4)** (issue #6)

  **Goal**: All / Active / Done filters + case-insensitive search (intersection).

  **Independent test**: Quickstart Scenario 5.

  **TDD cycles** (`tests/unit/filters.test.ts` → `src/lib/filters.ts`):

  - [ ] RED→GREEN: active filter shows only non-done tasks
  - [ ] RED→GREEN: done filter shows only done tasks
  - [ ] RED→GREEN: all filter shows every task
  - [ ] RED→GREEN: case-insensitive substring search
  - [ ] RED→GREEN: search ∩ filter intersection
  - [ ] RED→GREEN: no matches → empty list, no error

  **Store + UI**:

  - [ ] `filter`, `searchQuery`, `visibleTasks`, setters in `src/stores/taskStore.ts`
  - [ ] `SearchBar.tsx`, `FilterBar.tsx`; update `TaskList.tsx`, `App.tsx`

---

- [ ] T007 **Phase 7: Polish** (issue #7)

  **Goal**: Accessibility, UI polish, full validation.

  **Checkpoint**: `pnpm check` passes; quickstart scenarios validated.

  - [ ] Keyboard: tab order (add → search → filters → rows); Enter/Space on task name
  - [ ] `role="group"`, `aria-label="Filter tasks"` on `FilterBar.tsx`
  - [ ] Final layout/spacing per ui-contract in `src/index.css`
  - [ ] Run `pnpm check`; fix failures
  - [ ] Manual validation: all scenarios in `quickstart.md`

---

## Dependencies & Execution Order

```text
T001 Setup → T002 Foundational → T003 US1 (MVP) → T004 US2 → T005 US3 → T006 US4 → T007 Polish
```

Each phase is one GitHub issue. Complete phases in order; within a phase, follow TDD sub-checklists sequentially.

### TDD rules (within each phase)

1. One behavior per RED→GREEN cycle — do not batch all tests then all code
2. Test public store interfaces, not implementation details
3. UI sub-items run after store behavior cycles are GREEN
4. Refactor only when the suite is GREEN

### MVP scope

Complete **T001 + T002 + T003**, then stop and validate quickstart Scenarios 1–2.

---

## Notes

- Package manager: **pnpm**
- Add form under header, above search/filters
- New tasks append to bottom (`createdAt` sort)
- **74 sub-items** were consolidated into these **7 phase tasks** for issue tracking
