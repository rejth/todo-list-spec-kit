import type { Task } from "../types/task";

/**
 * A single task row. Phase T003 renders the name only; completion toggle,
 * delete, and important controls arrive in later phases.
 */
export function TaskItem(props: { task: Task }) {
  return (
    <li class="task-item">
      <span class="task-item__name">{props.task.name}</span>
    </li>
  );
}
