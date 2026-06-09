export interface Task {
  id: number;
  name: string;
  done: boolean;
  important: boolean;
  createdAt: number;
}

export type NewTask = Omit<Task, "id">;

export type TaskPatch = Partial<Pick<Task, "name" | "done" | "important">>;

export type Filter = "all" | "active" | "done";
