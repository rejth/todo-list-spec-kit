import { statusSummary } from "../stores/taskStore";

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
