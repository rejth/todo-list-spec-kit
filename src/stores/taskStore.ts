import { createSignal } from "solid-js";
import { StorageService } from "../lib/storage/StorageService";
import type { Task } from "../types/task";

const [tasksSignal, setTasks] = createSignal<Task[]>([]);
const [errorSignal, setError] = createSignal<string | null>(null);

let service: StorageService | null = null;

/** Read-only list of all tasks, ordered by createdAt ascending. */
export const tasks = tasksSignal;

/** Last persistence failure message, or null when healthy. */
export const persistenceError = errorSignal;

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

/** Test-only: drop the cached service and reset in-memory state. */
export function resetTaskStore(): void {
  StorageService.reset();
  service = null;
  setTasks([]);
  setError(null);
}
