import { toggleDone } from "../stores/taskStore";
import type { Task } from "../types/task";

/**
 * A single task row. Clicking the name toggles completion (strikethrough when done).
 * Delete and important controls arrive in later phases.
 */
export function TaskItem(props: { task: Task }) {
  return (
    <li class="task-item">
      <button
        type="button"
        class="task-item__name"
        classList={{ "task-item__name--done": props.task.done }}
        onClick={() => toggleDone(props.task.id)}
      >
        {props.task.name}
      </button>
    </li>
  );
}
