import type { Filter, Task } from "../types/task";

export function getVisibleTasks(tasks: Task[], filter: Filter, searchQuery: string): Task[] {
  const query = searchQuery.trim().toLowerCase();

  return tasks
    .filter((task) => {
      if (filter === "active" && task.done) {
        return false;
      }
      if (filter === "done" && !task.done) {
        return false;
      }
      return task.name.toLowerCase().includes(query);
    })
    .toSorted((a, b) => a.createdAt - b.createdAt);
}

export function getStatusSummary(tasks: Task[]): { active: number; done: number } {
  let active = 0;
  let done = 0;

  for (const task of tasks) {
    if (task.done) {
      done += 1;
    } else {
      active += 1;
    }
  }

  return { active, done };
}
