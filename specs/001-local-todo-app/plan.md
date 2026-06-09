# Implementation Plan: Local-First To-Do App

**Branch**: `001-local-todo-app` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-local-todo-app/spec.md`

## Summary

Build a local-first single-page to-do application where users add tasks, mark them
done (click name), delete them, flag as important, and filter/search the list.
All task data persists in IndexedDB via `tiny-idb-store`. The UI follows the
provided screenshot design: header with counts, add form directly under header,
search + segmented filters, and flat task list with icon buttons.

**Technical approach**: Solid.js + Vite SPA; TypeScript throughout; pnpm for package
management; Vitest for automated tests; Biome + Oxlint + Lefthook for code quality;
IndexedDB persistence through a `TasksStore` extending `BaseStore`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Package Manager**: pnpm

**Primary Dependencies**: Solid.js, Vite, tiny-idb-store@^0.1.2

**Storage**: IndexedDB — database `todo-db`, object store `tasks` (see [contracts/task-store.md](./contracts/task-store.md))

**Testing**: Vitest + fake-indexeddb; `@solidjs/testing-library` for component tests

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — latest two versions); local dev via Vite

**Project Type**: Single-page web application

**Performance Goals**: Actions complete with visible feedback <1s for ≤200 tasks (SC-004); no pagination/virtualization

**Constraints**: Offline after initial load; keyboard-accessible; minimal runtime dependencies; plain CSS matching screenshot design

**Scale/Scope**: One screen, one entity (Task), ~10 source components, ≤200 tasks per success criteria

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Spec-First (I)**: Feature originates from approved `spec.md` with prioritized user stories, functional requirements, and measurable success criteria
- [x] **Independent Stories (II)**: P1–P4 user stories independently testable per spec; MVP = P1 (add/view/persist)
- [x] **Core Test Coverage (III)**: Vitest tests planned for add, read, update (toggle done/important), delete, and persistence reload (see [research.md](./research.md) §3)
- [x] **Simplicity (IV)**: Single SPA, no backend, no state library, no CSS framework — focused todo list only
- [x] **Persistence (V)**: IndexedDB via tiny-idb-store declared; error banner on write failure; no silent data loss

*Post-design re-check (Phase 1): All gates pass. No Complexity Tracking entries required.*

## Project Structure

### Documentation (this feature)

```text
specs/001-local-todo-app/
├── plan.md              # This file
├── research.md          # Phase 0 — technology decisions
├── data-model.md        # Phase 1 — Task entity and schema
├── quickstart.md        # Phase 1 — validation scenarios
├── contracts/
│   ├── ui-contract.md   # UI layout, interactions, visual states
│   └── task-store.md    # IndexedDB persistence interface
└── tasks.md             # Phase 2 (/speckit-tasks — not yet created)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── App.tsx
│   ├── Header.tsx
│   ├── AddTaskForm.tsx
│   ├── SearchBar.tsx
│   ├── FilterBar.tsx
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   └── ErrorBanner.tsx
├── stores/
│   └── taskStore.ts          # Solid reactive store + persistence orchestration
├── lib/
│   ├── storage/
│   │   ├── StorageService.ts # IDB connection singleton
│   │   └── TasksStore.ts     # extends BaseStore from tiny-idb-store
│   └── filters.ts            # getVisibleTasks, getStatusSummary
├── types/
│   └── task.ts
├── index.tsx
├── index.css                 # Design tokens + layout per ui-contract
└── App.module.css            # Optional scoped styles

tests/
├── setup.ts                  # fake-indexeddb init
├── unit/
│   ├── filters.test.ts
│   ├── TasksStore.test.ts
│   └── taskStore.test.ts
└── integration/
    └── persistence.test.ts

index.html
vite.config.ts
vitest.config.ts
biome.json
oxlintrc.json                 # or .oxlintrc.json
lefthook.yml
tsconfig.json
package.json
pnpm-lock.yaml
```

**Structure Decision**: Single-project layout at repository root. Components map 1:1
to UI contract sections. Storage isolated in `src/lib/storage/` wrapping
tiny-idb-store. Pure filter/summary logic in `src/lib/filters.ts` for easy unit testing.

## Phase 0: Research

Completed — see [research.md](./research.md).

Key decisions:

- Solid.js + Vite for UI
- IndexedDB + tiny-idb-store for persistence
- Vitest + fake-indexeddb for tests
- Biome + Oxlint + Lefthook for quality gates
- Plain CSS matching screenshot design
- `createdAt` timestamp for stable list ordering

## Phase 1: Design & Contracts

Completed artifacts:

| Artifact | Path | Purpose |
|----------|------|---------|
| Data model | [data-model.md](./data-model.md) | Task entity, validation, state transitions, IDB schema |
| UI contract | [contracts/ui-contract.md](./contracts/ui-contract.md) | Layout, components, interactions, visual states from screenshots |
| Storage contract | [contracts/task-store.md](./contracts/task-store.md) | TasksStore, StorageService, reactive store API |
| Quickstart | [quickstart.md](./quickstart.md) | Setup commands and manual validation scenarios |

## Test Strategy

Per constitution Principle III, core CRUD behaviors MUST have automated tests.
Development follows **vertical-slice TDD** (tracer bullets): one behavior → one
failing test → minimal code to pass → repeat. Do **not** batch-write all tests
then all implementation (horizontal slicing).

See [Testing Approach](#testing-approach) below for workflow, public interfaces,
and anti-patterns.

### Testing Approach

**Workflow**: RED → GREEN → REFACTOR, one behavior at a time.

```text
RIGHT (vertical — use this):
  RED→GREEN: "add makes task retrievable" → test + minimal add/get
  RED→GREEN: "empty name rejected"       → test + validation
  RED→GREEN: "toggle done persists"      → test + toggleDone
  ...

WRONG (horizontal — do NOT do this):
  RED:   all TasksStore tests, all taskStore tests, all filter tests
  GREEN: implement entire storage layer, then entire store, then UI
```

**Tracer bullet** (first cycle): one end-to-end storage test — add a task via
`TasksStore`, read it back — with minimal `StorageService` + `TasksStore` code.
Proves IndexedDB + fake-indexeddb + Vitest path before building the rest.

**Public interfaces under test** (behavior-facing, not implementation details):

| Interface | Module | What tests assert |
|-----------|--------|-------------------|
| Task persistence | `TasksStore` via `StorageService.create()` | Records retrievable after add/update/delete through store methods |
| Application store | `taskStore.ts` exports (`addTask`, `toggleDone`, …) | Observable task list and flags change; empty-name rejection |
| View projection | `getVisibleTasks()`, `getStatusSummary()` | Filter/search/count outcomes given task arrays |
| UI | Manual quickstart scenarios | Layout, styling, keyboard — not unit-tested unless a behavior gap appears |

**Test style rules**:

- Assert **observable behavior** through public APIs — not call order, not private methods.
- Do **not** mock `TasksStore` or internal store helpers when testing `taskStore`; use real `fake-indexeddb`.
- Prefer integration-style store tests over isolated implementation-detail tests.
- Refactor only when GREEN; never refactor while RED.
- UI components follow after their backing store behavior is GREEN; validate UI via quickstart.

**Tooling**: Vitest + `fake-indexeddb` in `tests/setup.ts`. Test files:

| File | Behaviors covered |
|------|-------------------|
| `tests/unit/TasksStore.test.ts` | Storage CRUD through `TasksStore` public methods |
| `tests/unit/taskStore.test.ts` | Add, validate, toggle done/important, delete via `taskStore` exports |
| `tests/unit/filters.test.ts` | Filter, search, intersection, empty states |
| `tests/integration/persistence.test.ts` | Tasks survive `StorageService` re-init |

**Priority behaviors** (constitution-mandated, in TDD order):

1. Add task → retrievable (storage tracer bullet)
2. Load all tasks on init
3. Add via `taskStore` → appears in list; empty name rejected; whitespace trimmed
4. Tasks persist after service re-create
5. Toggle done → persists; toggle important → persists; delete → gone after reload
6. Filter (all/active/done) + search intersection
7. Edge: duplicate names allowed; persistence error surfaces `persistenceError`

**Out of scope for automated tests**: CSS pixel parity, SVG icon shapes, parallel
bulk test authorship. Use quickstart manual scenarios for full UI contract validation.

### Coverage Map

| Operation | Test file | Example behavior assertion |
|-----------|-----------|----------------------------|
| Create | `taskStore.test.ts` | `addTask("Buy milk")` → task in `tasks()` with trimmed name |
| Read | `TasksStore.test.ts` | After add, `getAll()` includes task with assigned id |
| Update (done) | `taskStore.test.ts` | `toggleDone(id)` → `done` flipped; survives re-init |
| Update (important) | `taskStore.test.ts` | `toggleImportant(id)` → `important` flipped; persists |
| Delete | `taskStore.test.ts` | `deleteTask(id)` → absent from `tasks()` after re-init |
| Persistence reload | `persistence.test.ts` | Tasks written in one service instance readable in a new one |
| Filter/search | `filters.test.ts` | Active filter excludes done; search ∩ filter applied |
| Edge: duplicate names | `taskStore.test.ts` | Two `addTask("same")` → distinct ids |
| Edge: empty list | `filters.test.ts` | Empty input → empty visible list, no throw |

## Implementation Notes

1. **Icons**: Use inline SVG for trash and exclamation icons (no icon library dependency).
2. **Init flow**: `App.tsx` calls `initTaskStore()` in `onMount`; show loading state until IDB ready.
3. **Filter default**: `all` on load; search empty — not persisted.
4. **Status header**: Computed from full task list, not filtered view.
5. **No edit-in-place**: Task rename out of scope; names set only at creation.

## Complexity Tracking

> No violations — table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
