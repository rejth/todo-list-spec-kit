import { createSignal, Show } from "solid-js";
import { addTask } from "../stores/taskStore";

/** Input + button to add a task. Blocks empty/whitespace names with inline validation. */
export function AddTaskForm() {
  const [value, setValue] = createSignal("");
  const [error, setError] = createSignal(false);

  async function submit(event: Event) {
    event.preventDefault();
    if (!value().trim()) {
      setError(true);
      return;
    }
    await addTask(value());
    setValue("");
    setError(false);
  }

  return (
    <form class="add-form" onSubmit={submit}>
      <input
        class="add-form__input"
        type="text"
        placeholder="type to add new task"
        value={value()}
        onInput={(event) => {
          setValue(event.currentTarget.value);
          if (error()) {
            setError(false);
          }
        }}
        aria-label="New task name"
        aria-invalid={error()}
      />
      <button class="add-form__button" type="submit">
        Add task
      </button>
      <Show when={error()}>
        <p class="add-form__error" role="alert">
          Task name cannot be empty
        </p>
      </Show>
    </form>
  );
}
