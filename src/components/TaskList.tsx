import { For, Show } from "solid-js";
import { tasks, visibleTasks } from "../stores/taskStore";
import { TaskItem } from "./TaskItem";

export function TaskList() {
  return (
    <Show
      when={visibleTasks().length > 0}
      fallback={
        <p class="task-list__empty">
          {tasks().length === 0 ? "No tasks yet" : "No tasks match your search"}
        </p>
      }
    >
      <ul class="task-list">
        <For each={visibleTasks()}>{(task) => <TaskItem task={task} />}</For>
      </ul>
    </Show>
  );
}
