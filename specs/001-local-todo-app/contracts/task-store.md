# Storage Contract: Task Persistence

**Feature**: 001-local-todo-app | **Date**: 2026-06-09  
**Library**: `tiny-idb-store@^0.1.2`

Defines the persistence layer interface between the application and IndexedDB.

## Database Configuration

| Setting | Value |
|---------|-------|
| Package | `tiny-idb-store` |
| DB name | `todo-db` |
| DB version | `1` |
| Object store | `tasks` |
| Key path | `id` with `{ autoIncrement: true }` |

## Class: TasksStore

Extends `BaseStore` from `tiny-idb-store`.

```typescript
import { BaseStore } from "tiny-idb-store";
import type { Task } from "../types/task";

export class TasksStore extends BaseStore {
  constructor(db: IDBDatabase) {
    super(db, "tasks");
  }
}
```

Inherited methods used by the application:

| Method | Signature (conceptual) | Usage |
|--------|------------------------|-------|
| `add` | `(record: Omit<Task, "id">) => Promise<number>` | Create task; returns new id |
| `get` | `(id: number) => Promise<Task \| undefined>` | Read single task |
| `getAll` | `() => Promise<Task[]>` | Load all tasks on init |
| `update` | `(id: number, patch: Partial<Task>) => Promise<boolean>` | Patch done/important; returns false if missing |
| `delete` | `(id: number) => Promise<void>` | Remove task |
| `clear` | `() => Promise<void>` | Test helper only |

## Class: StorageService

Singleton managing database lifecycle.

```typescript
export class StorageService {
  private static instance: StorageService | null = null;
  private db: IDBDatabase | null = null;
  private tasksStore: TasksStore | null = null;

  static async create(): Promise<StorageService>;
  get tasks(): TasksStore; // throws if not initialized
}
```

### Lifecycle events

| Event | Handler |
|-------|---------|
| `upgradeneeded` (v0→1) | Create `tasks` object store |
| `success` | Resolve connection; attach close/versionchange listeners |
| `error` | Reject initialization promise |
| `blocked` | Alert user to close other tabs |
| `versionchange` | Close DB; prompt reload |

## Application Store Contract (`taskStore.ts`)

Higher-level API consumed by UI components:

| Function | Parameters | Returns | Side effects |
|----------|------------|---------|--------------|
| `initTaskStore` | — | `Promise<void>` | Opens IDB, loads tasks into reactive store |
| `addTask` | `name: string` | `Promise<void>` | Validates, trims, persists, updates signal |
| `toggleDone` | `id: number` | `Promise<void>` | Flip done, persist |
| `toggleImportant` | `id: number` | `Promise<void>` | Flip important, persist |
| `deleteTask` | `id: number` | `Promise<void>` | Remove, persist |
| `setFilter` | `filter: Filter` | `void` | Update view state (not persisted) |
| `setSearchQuery` | `query: string` | `void` | Update view state (not persisted) |

### Reactive exports (Solid)

```typescript
// Read-only accessors for components
export const tasks: Accessor<Task[]>;
export const filter: Accessor<Filter>;
export const searchQuery: Accessor<string>;
export const persistenceError: Accessor<string | null>;
export const visibleTasks: Accessor<Task[]>;  // memo
export const statusSummary: Accessor<{ active: number; done: number }>;  // memo
```

## Error Contract

| Failure | UI response | In-memory state |
|---------|-------------|-----------------|
| IDB open fails | Error banner; empty task list | No tasks loaded |
| Write fails on mutation | Error banner with message | Mutation kept in memory for session |
| Record not found on update | Log/ignore; refresh from store | Re-sync from IDB |

All persistence errors MUST surface to the user (FR-014, constitution V).

## Test Contract

Tests use **vertical-slice TDD**: one behavior, one RED→GREEN cycle. Assert through
public interfaces only; use `fake-indexeddb` (no mocks of internal storage helpers).

### Tracer bullet (first cycle)

RED: `"add makes task retrievable by id"` in `tests/unit/TasksStore.test.ts`  
GREEN: minimal `TasksStore.add` / `TasksStore.get` + `StorageService` until pass

### Subsequent behavior cycles (examples)

Each row is one RED→GREEN cycle — write the failing test, then minimal code:

| # | Behavior assertion | Public interface |
|---|-------------------|------------------|
| 1 | `getAll` includes added tasks | `TasksStore.getAll()` |
| 2 | `update` patches `done` / `important` | `TasksStore.update()` |
| 3 | `delete` removes from `getAll` | `TasksStore.delete()` |
| 4 | `addTask` adds to `tasks()` accessor | `addTask()` export |
| 5 | `addTask` rejects empty/whitespace name | `addTask()` export |
| 6 | Tasks survive `StorageService` re-create | `initTaskStore()` + new service instance |
| 7 | `toggleDone` / `toggleImportant` persist | store exports + re-init |
| 8 | `deleteTask` absent after re-init | `deleteTask()` + re-init |
| 9 | `getVisibleTasks` filter ∩ search | `getVisibleTasks()` |
| 10 | Duplicate names → distinct ids | two `addTask()` calls |

Do **not** write rows 2–10 as a batch before row 1 is GREEN.

## Versioning Policy

- Increment `todo-db` version only when schema changes require migration.
- v1: single object store, no indexes.
- Future: add `done` index if query performance becomes a concern (out of current scope).
