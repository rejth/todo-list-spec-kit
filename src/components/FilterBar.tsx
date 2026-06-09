import { For } from "solid-js";
import { filter, setFilter } from "../stores/taskStore";
import type { Filter } from "../types/task";

const OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

export function FilterBar() {
  return (
    <fieldset class="filter-bar">
      <legend class="filter-bar__legend">Filter tasks</legend>
      <For each={OPTIONS}>
        {(option) => (
          <button
            type="button"
            class="filter-bar__button"
            classList={{ "filter-bar__button--active": filter() === option.value }}
            aria-pressed={filter() === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        )}
      </For>
    </fieldset>
  );
}
