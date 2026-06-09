import { For } from "solid-js";
import { filter, setFilter } from "../stores/taskStore";
import type { Filter } from "../types/task";

const OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

/** Segmented control selecting the active list filter. */
export function FilterBar() {
  return (
    // biome-ignore lint/a11y/useSemanticElements: ui-contract mandates role="group" with aria-label for the segmented filter control
    <div class="filter-bar" role="group" aria-label="Filter tasks">
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
    </div>
  );
}
