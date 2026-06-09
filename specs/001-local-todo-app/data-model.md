# Data Model: Local-First To-Do App

**Feature**: 001-local-todo-app | **Date**: 2026-06-09

## Entity: Task

Represents a single to-do item persisted in IndexedDB.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `number` | auto | — | Primary key; auto-increment via IndexedDB |
| `name` | `string` | yes | — | Display text; trimmed before save; max practical length unbounded |
| `done` | `boolean` | yes | `false` | Completion state; toggled by clicking task name |
| `important` | `boolean` | yes | `false` | Priority flag; toggled by Mark Important button |
| `createdAt` | `number` | yes | `Date.now()` | Unix timestamp (ms); determines list order |

### TypeScript Interface

```typescript
interface Task {
  id: number;
  name: string;
  done: boolean;
  important: boolean;
  createdAt: number;
}

/** Fields supplied when creating a task (id assigned by store) */
type NewTask = Omit<Task, "id">;

/** Partial update payload for toggle/patch operations */
type TaskPatch = Partial<Pick<Task, "name" | "done" | "important">>;
```

### Validation Rules

| Rule | Enforcement | Error behavior |
|------|-------------|----------------|
| `name` MUST NOT be empty after trim | `AddTaskForm` + store layer | Block create; show inline validation message |
| `name` trimmed on create/update | Store layer before `add`/`put` | Silent trim |
| `id` immutable after create | Store layer | Reject put with changed id |
| Duplicate names allowed | — | No uniqueness constraint |

### State Transitions

```text
                    ┌─────────────┐
         create     │   ACTIVE    │◄────────────────┐
        ──────────► │ done=false  │                 │
                    └──────┬──────┘                 │
                           │ click name             │ click name
                           ▼                        │
                    ┌─────────────┐                 │
                    │    DONE     │─────────────────┘
                    │ done=true   │
                    └──────┬──────┘
                           │
              important toggle (independent, any state)
                           │
                    ┌──────▼──────┐
                    │  IMPORTANT  │  (orthogonal flag; combinable with done)
                    │ important=  │
                    │ true/false  │
                    └─────────────┘

delete ──► (removed from store, any state)
```

- **Toggle done**: `done` flips on task name click (active ↔ done).
- **Toggle important**: `important` flips on Mark Important click; independent of `done`.
- **Delete**: record removed from IndexedDB and in-memory store.

## Entity: ViewState (ephemeral, not persisted)

UI-only state reset on page load per spec assumptions.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `filter` | `"all" \| "active" \| "done"` | `"all"` | Current list filter |
| `searchQuery` | `string` | `""` | Case-insensitive substring filter on `name` |
| `persistenceError` | `string \| null` | `null` | Last persistence failure message |

### Derived: VisibleTasks

Computed from `Task[]` + `ViewState`:

```typescript
function getVisibleTasks(tasks: Task[], filter: Filter, searchQuery: string): Task[] {
  // 1. Filter by done state
  // 2. Filter by searchQuery (case-insensitive includes on name)
  // 3. Sort by createdAt ascending
}
```

### Derived: StatusSummary

```typescript
function getStatusSummary(tasks: Task[]): { active: number; done: number } {
  // active = tasks where done === false
  // done = tasks where done === true
  // Display: "{active} more to do, {done} done"
}
```

## IndexedDB Schema

| Property | Value |
|----------|-------|
| Database name | `todo-db` |
| Version | `1` |
| Object store | `tasks` |
| Key path | `id` (autoIncrement) |
| Indexes | none (full scan acceptable for ≤200 tasks per success criteria) |

### Upgrade Path (v1)

```typescript
// onupgradeneeded, oldVersion === 0:
db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
```

Future versions may add indexes (e.g., `done`) if task counts grow beyond spec scope.

## Storage Operations Map

| User action | Store method | Record change |
|-------------|--------------|---------------|
| Add task | `TasksStore.add({ name, done: false, important: false, createdAt })` | Insert |
| Toggle done | `TasksStore.update(id, { done: !current.done })` | Patch |
| Toggle important | `TasksStore.update(id, { important: !current.important })` | Patch |
| Delete task | `TasksStore.delete(id)` | Remove |
| App load | `TasksStore.getAll()` | Read all → hydrate store |

## Relationships

- **Task ↔ ViewState**: no persistence link; ViewState filters a read-only projection of Task[].
- **TasksStore ↔ StorageService**: one `TasksStore` instance per open `IDBDatabase` connection.

## Edge Case Data Handling

| Scenario | Data behavior |
|----------|---------------|
| Empty name submit | No `add` call; validation message shown |
| Whitespace-only name | Trim → empty → reject |
| Identical names | Separate records with distinct `id` |
| Delete last visible (filtered) | Record deleted from store; filtered view empty |
| IDB write failure | In-memory mutation kept; `persistenceError` set; retry on next action optional |
| Long task name | Full string stored; CSS handles display wrap/truncate |
