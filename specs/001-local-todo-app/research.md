# Research: Local-First To-Do App

**Feature**: 001-local-todo-app | **Date**: 2026-06-09

## 1. Frontend Framework — Solid.js

**Decision**: Use Solid.js with Vite for the single-page application.

**Rationale**: Solid provides fine-grained reactivity without a virtual DOM, which suits a
simple list UI with frequent state updates (toggle done, filter, search). Vite offers
fast dev server and native ESM. The user explicitly specified this stack.

**Alternatives considered**:

- React — heavier runtime; user did not request it (screenshots show React example text only as sample data).
- Vanilla JS — fewer dependencies but more manual DOM management for reactive list updates.

## 2. Persistence — IndexedDB via tiny-idb-store

**Decision**: Use IndexedDB with `tiny-idb-store@^0.1.2` as the thin object-store wrapper.

**Rationale**: User requirement. The library provides typed, promise-based CRUD (`add`,
`get`, `getAll`, `put`, `update`, `delete`) by extending `BaseStore`. Zero runtime
dependencies. Supports auto-increment keys suitable for Task entities.

**Storage pattern**:

- Database: `todo-db` (version 1)
- Object store: `tasks` with `{ keyPath: "id", autoIncrement: true }`
- `TasksStore extends BaseStore` for task CRUD
- `StorageService` singleton handles DB open, upgrade, and connection lifecycle (per library README)

**Alternatives considered**:

- `localStorage` — simpler but synchronous, size-limited, no structured queries; spec originally mentioned "browser storage" but user chose IndexedDB.
- Raw IndexedDB API — verbose transaction/error handling; rejected per user preference for thin wrapper.
- `tiny-idb` (key-value) — different package; stores flat key-value pairs rather than typed records with auto-increment IDs.

## 3. Testing — Vitest + vertical-slice TDD

**Decision**: Vitest with `fake-indexeddb`; **vertical-slice TDD** (one behavior per
RED→GREEN cycle); integration-style tests through public store interfaces.

**Rationale**: User specified Vitest. Constitution requires automated tests for core
CRUD. Vertical TDD avoids horizontal slicing (bulk tests that guess behavior before
code exists). fake-indexeddb exercises real IndexedDB code paths in Node without
mocking internal storage helpers.

**Workflow** (per `/tdd` skill):

1. **Tracer bullet**: one storage test (add → retrievable) + minimal `TasksStore` /
   `StorageService` until GREEN.
2. **Incremental loop**: for each behavior — RED (one failing test describing WHAT) →
   GREEN (minimal code) → optional REFACTOR when suite is GREEN.
3. **UI last**: Solid components wired after backing store behaviors pass; UI
   validated via quickstart manual scenarios.

**Public interfaces under test**:

| Layer | Interface | Avoid |
|-------|-----------|-------|
| Storage | `TasksStore` methods via `StorageService.create()` | Mocking IDB or BaseStore internals |
| App store | `taskStore.ts` exported functions + accessors | Testing private helpers |
| Filters | `getVisibleTasks`, `getStatusSummary` | Asserting sort implementation details |

**Test style**:

- Good: `"addTask makes task appear in tasks list"`, `"toggleDone persists after re-init"`
- Bad: `"addTask calls TasksStore.add"`, bulk tests written before any implementation

**Alternatives considered**:

- Horizontal TDD (all tests first) — rejected; produces brittle tests coupled to imagined APIs.
- Playwright E2E as primary — slower; defer to quickstart for UI contract.
- Component unit tests for every widget — deferred; store is the behavior core.

## 4. Package Manager — pnpm

**Decision**: Use pnpm for dependency installation and script execution.

**Rationale**: User preference. pnpm provides efficient disk usage and strict
dependency resolution suitable for a small Vite project.

**Alternatives considered**:
- npm / yarn — not requested by user.

## 5. Linting & Git Hooks — Biome, Oxlint, Lefthook

**Decision**: Biome for format + lint; Oxlint for fast supplementary lint pass;
Lefthook for pre-commit hooks running lint and test.

**Rationale**: User-specified toolchain. Biome handles formatting and primary lint;
Oxlint adds speed/complementary rules; Lefthook orchestrates hooks without Husky.

**Alternatives considered**:

- ESLint + Prettier — user did not request; Biome replaces both.

## 6. State Management — Solid signals + thin task store module

**Decision**: Module-level Solid `createStore` / signals in `src/stores/taskStore.ts`
backed by `StorageService`. No external state library.

**Rationale**: Single-screen app with one entity collection; external stores (Redux, etc.)
violate constitution simplicity principle.

**Flow**:

1. App init → `StorageService.create()` → load all tasks → hydrate store
2. User action → update in-memory store → persist via `TasksStore` → show error toast on failure
3. Filter/search derived via `createMemo` over task list

## 7. UI Design — Screenshot reference

**Decision**: Implement layout and visual states per provided screenshots and
`contracts/ui-contract.md`.

**Key visual rules extracted**:

- Header with title + dynamic count ("N more to do, M done")
- Segmented filter buttons (All / Active / Done); active = solid blue
- Done tasks: strikethrough on name
- Important tasks: bold blue text (can combine with strikethrough when both)
- Delete: red-bordered icon button; Important: green-bordered icon button
- Add form directly under header (above search/filters); placeholders: "type to add new task", "type to search task"

**Alternatives considered**: CSS framework (Bootstrap/Tailwind) — not specified; use plain CSS matching screenshot spacing and colors for minimal dependencies.

## 8. Task Ordering

**Decision**: Store `createdAt` (Unix ms timestamp) on each task; display sorted ascending by `createdAt`.

**Rationale**: Spec requires new tasks at end of list; auto-increment ID correlates with insert order but `createdAt` is explicit and testable.

## 9. Error Handling for Persistence Failures

**Decision**: Non-blocking error banner/toast when IndexedDB write fails; in-memory state retained for session.

**Rationale**: Satisfies FR-014 and constitution Principle V. Matches spec edge case for storage unavailable.

## 10. Accessibility

**Decision**: All interactive elements keyboard-focusable; buttons have `aria-label`; task name click/toggle accessible via Enter on focused row.

**Rationale**: Constitution technology constraints require keyboard accessibility.

## 11. Resolved Clarifications

All technical context items resolved — no NEEDS CLARIFICATION remain:

| Item | Resolution |
|------|------------|
| Language | TypeScript 5.x |
| UI framework | Solid.js + Vite |
| Storage | IndexedDB + tiny-idb-store |
| Testing | Vitest |
| Package manager | pnpm |
| Lint/format | Biome + Oxlint + Lefthook |
| Design | Screenshot contract |
