import { statusSummary } from "../stores/taskStore";

/** App title plus a live "{active} more to do, {done} done" summary over all tasks. */
export function Header() {
  return (
    <header class="header">
      <h1 class="header__title">To-Do List</h1>
      <p class="header__summary">
        {statusSummary().active} more to do, {statusSummary().done} done
      </p>
    </header>
  );
}
