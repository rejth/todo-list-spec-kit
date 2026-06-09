import { createMemo, createSignal } from "solid-js";
import { getStatusSummary, getVisibleTasks } from "../lib/filters";
import { StorageService } from "../lib/storage/StorageService";
import type { Filter, NewTask, Task } from "../types/task";

const [tasksSignal, setTasks] = createSignal<Task[]>([]);
const [errorSignal, setError] = createSignal<string | null>(null);
const [filterSignal, setFilterSignal] = createSignal<Filter>("all");
const [searchSignal, setSearchSignal] = createSignal("");

let service: StorageService | null = null;

/** Read-only list of all tasks, ordered by createdAt ascending. */
export const tasks = tasksSignal;

/** Last persistence failure message, or null when healthy. */
export const persistenceError = errorSignal;

/** Active/done counts over all tasks; drives the header summary. */
export const statusSummary = createMemo(() => getStatusSummary(tasksSignal()));

/** Current list filter (ephemeral view state, not persisted). */
export const filter = filterSignal;

/** Current case-insensitive search query (ephemeral, not persisted). */
export const searchQuery = searchSignal;

/** Tasks projected through the active filter and search query. */
export const visibleTasks = createMemo(() =>
  getVisibleTasks(tasksSignal(), filterSignal(), searchSignal()),
);

/** Sets the list filter (all/active/done). */
export function setFilter(value: Filter): void {
  setFilterSignal(value);
}

/** Sets the search query. */
export function setSearchQuery(value: string): void {
  setSearchSignal(value);
}

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

/**
 * Persists `patch` for the task with `id`, then mirrors the change in memory.
 * Keeps the session state even if the write fails, surfacing persistenceError.
 */
async function patchTask(id: number, patch: Partial<Task>): Promise<void> {
  if (!service) {
    setError("Storage is not ready.");
    return;
  }
  try {
    await service.tasks.update(id, patch);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to save task.");
  }
  setTasks(tasksSignal().map((task) => (task.id === id ? { ...task, ...patch } : task)));
}

/** Toggles a task's completion state and persists it. */
export async function toggleDone(id: number): Promise<void> {
  const current = tasksSignal().find((task) => task.id === id);
  if (!current) {
    return;
  }
  await patchTask(id, { done: !current.done });
}

/** Toggles a task's important flag and persists it. */
export async function toggleImportant(id: number): Promise<void> {
  const current = tasksSignal().find((task) => task.id === id);
  if (!current) {
    return;
  }
  await patchTask(id, { important: !current.important });
}

/** Removes a task from storage and the in-memory list. */
export async function deleteTask(id: number): Promise<void> {
  if (!service) {
    setError("Storage is not ready.");
    return;
  }
  try {
    await service.tasks.delete(id);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to delete task.");
  }
  setTasks(tasksSignal().filter((task) => task.id !== id));
}

/** Test-only: drop the cached service and reset in-memory state. */
export function resetTaskStore(): void {
  StorageService.reset();
  service = null;
  setTasks([]);
  setError(null);
}
