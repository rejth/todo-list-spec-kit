/** A single to-do item persisted in IndexedDB. */
export interface Task {
  id: number;
  name: string;
  done: boolean;
  important: boolean;
  createdAt: number;
}

/** Fields supplied when creating a task; `id` is assigned by the store. */
export type NewTask = Omit<Task, "id">;

/** Partial update payload for toggle/patch operations. */
export type TaskPatch = Partial<Pick<Task, "name" | "done" | "important">>;

/** Current list filter (ephemeral view state, not persisted). */
export type Filter = "all" | "active" | "done";
