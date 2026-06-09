import { For, Show } from "solid-js";
import { tasks } from "../stores/taskStore";
import { TaskItem } from "./TaskItem";

/** Bordered list of tasks with an empty-state message when there are none. */
export function TaskList() {
  return (
    <Show when={tasks().length > 0} fallback={<p class="task-list__empty">No tasks yet</p>}>
      <ul class="task-list">
        <For each={tasks()}>{(task) => <TaskItem task={task} />}</For>
      </ul>
    </Show>
  );
}
