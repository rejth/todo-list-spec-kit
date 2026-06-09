import { createSignal, onMount, Show } from "solid-js";
import { initTaskStore } from "../stores/taskStore";
import { AddTaskForm } from "./AddTaskForm";
import { ErrorBanner } from "./ErrorBanner";
import { FilterBar } from "./FilterBar";
import { Header } from "./Header";
import { SearchBar } from "./SearchBar";
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
        <div class="toolbar">
          <SearchBar />
          <FilterBar />
        </div>
        <TaskList />
      </Show>
    </main>
  );
}
