import { createMemo, createSignal } from "solid-js";
import { getStatusSummary } from "../lib/filters";
import { StorageService } from "../lib/storage/StorageService";
import type { NewTask, Task } from "../types/task";

const [tasksSignal, setTasks] = createSignal<Task[]>([]);
const [errorSignal, setError] = createSignal<string | null>(null);

let service: StorageService | null = null;

/** Read-only list of all tasks, ordered by createdAt ascending. */
export const tasks = tasksSignal;

/** Last persistence failure message, or null when healthy. */
export const persistenceError = errorSignal;

/** Active/done counts over all tasks; drives the header summary. */
export const statusSummary = createMemo(() => getStatusSummary(tasksSignal()));

function sortByCreatedAt(list: Task[]): Task[] {
  return list.toSorted((a, b) => a.createdAt - b.createdAt);
}

/** Opens IndexedDB and hydrates the in-memory task list. Call once on app mount. */
export async function initTaskStore(): Promise<void> {
  try {
    service = await StorageService.create();
    const all = await service.tasks.getAll<Task>();
    setTasks(sortByCreatedAt(all));
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load tasks.");
  }
}

/**
 * Validates and persists a new task, then appends it to the in-memory list.
 * Empty or whitespace-only names are rejected silently (UI shows inline validation).
 */
export async function addTask(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    return;
  }
  if (!service) {
    setError("Storage is not ready.");
    return;
  }
  const record: NewTask = {
    name: trimmed,
    done: false,
    important: false,
    createdAt: Date.now(),
  };
  try {
    const id = (await service.tasks.add(record)) as number;
    setTasks([...tasksSignal(), { id, ...record }]);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to save task.");
  }
}

/** Test-only: drop the cached service and reset in-memory state. */
export function resetTaskStore(): void {
  StorageService.reset();
  service = null;
  setTasks([]);
  setError(null);
}
