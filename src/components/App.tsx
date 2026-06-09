import { createSignal, onMount, Show } from "solid-js";
import { initTaskStore, persistenceError } from "../stores/taskStore";

/** Root component. Initializes storage on mount; shows loading until IDB is ready. */
export function App() {
  const [ready, setReady] = createSignal(false);

  onMount(async () => {
    await initTaskStore();
    setReady(true);
  });

  return (
    <main class="app">
      <h1>To-Do List</h1>
      <Show when={ready()} fallback={<p class="app__loading">Loading…</p>}>
        <Show when={persistenceError()}>{(message) => <p class="app__error">{message()}</p>}</Show>
        {/* Header, add form, search, filters, and list arrive in later phases. */}
      </Show>
    </main>
  );
}
