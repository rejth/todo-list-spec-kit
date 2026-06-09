import { createSignal, onMount, Show } from "solid-js";
import { initTaskStore } from "../stores/taskStore";
import { AddTaskForm } from "./AddTaskForm";
import { ErrorBanner } from "./ErrorBanner";
import { Header } from "./Header";
import { TaskList } from "./TaskList";

/** Root component. Initializes storage on mount; shows loading until IDB is ready. */
export function App() {
  const [ready, setReady] = createSignal(false);

  onMount(async () => {
    await initTaskStore();
    setReady(true);
  });

  return (
    <main class="app">
      <Header />
      <Show when={ready()} fallback={<p class="app__loading">Loading…</p>}>
        <ErrorBanner />
        <AddTaskForm />
        <TaskList />
      </Show>
    </main>
  );
}
