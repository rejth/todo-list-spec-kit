import type { Task } from "../types/task";

/** Active/done counts over all tasks; drives the header summary. */
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
