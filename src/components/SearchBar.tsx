import { searchQuery, setSearchQuery } from "../stores/taskStore";

export function SearchBar() {
  return (
    <input
      class="search-bar"
      type="search"
      placeholder="type to search task"
      value={searchQuery()}
      onInput={(event) => setSearchQuery(event.currentTarget.value)}
      aria-label="Search tasks"
    />
  );
}
