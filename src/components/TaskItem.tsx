import { deleteTask, toggleDone, toggleImportant } from "../stores/taskStore";
import type { Task } from "../types/task";

/**
 * A single task row. Clicking the name toggles completion (strikethrough when done);
 * the trash button deletes and the "!" button toggles the important flag.
 */
export function TaskItem(props: { task: Task }) {
  return (
    <li class="task-item">
      <button
        type="button"
        class="task-item__name"
        classList={{
          "task-item__name--done": props.task.done,
          "task-item__name--important": props.task.important,
        }}
        onClick={() => toggleDone(props.task.id)}
      >
        {props.task.name}
      </button>

      <button
        type="button"
        class="task-item__action task-item__action--delete"
        aria-label="Delete task"
        onClick={() => deleteTask(props.task.id)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 6h18M8 6V4h8v2m-9 0v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6M10 11v6M14 11v6"
          />
        </svg>
      </button>

      <button
        type="button"
        class="task-item__action task-item__action--important"
        classList={{ "task-item__action--active": props.task.important }}
        aria-label="Mark important"
        aria-pressed={props.task.important}
        onClick={() => toggleImportant(props.task.id)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4v10M12 18v2"
          />
        </svg>
      </button>
    </li>
  );
}
