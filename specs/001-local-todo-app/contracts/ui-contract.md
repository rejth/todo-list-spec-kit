# UI Contract: Local-First To-Do App

**Feature**: 001-local-todo-app | **Date**: 2026-06-09  
**Reference**: Design screenshots (All / Active / Done filter states)

This contract defines the user-visible interface: layout, components, interactions,
and visual states. Implementation MUST match this contract.

## Layout Structure

Single-column, centered content area. Top-to-bottom order:

```text
┌─────────────────────────────────────────────────────────────┐
│  To-Do List                          2 more to do, 1 done   │  ← Header
├─────────────────────────────────────────────────────────────┤
│  [ type to add new task         ] [ Add task ]              │  ← Add form
├─────────────────────────────────────────────────────────────┤
│  [ type to search task          ] [All|Active|Done]          │  ← Search + Filters
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Task name                              [🗑] [!]       │  │  ← Task rows
│  │ ─────────────────────────────────────────────────────  │  │
│  │ Task name                              [🗑] [!]       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

The add form sits directly under the header so the primary action is immediately
visible. Search and filters follow below it, then the task list.

## Components

### 1. Header


| Element        | Content                            | Style                            |
| -------------- | ---------------------------------- | -------------------------------- |
| Title          | `To-Do List`                       | Bold, black, left-aligned        |
| Status summary | `{active} more to do, {done} done` | Smaller grey text, right-aligned |


- Counts reflect **all tasks** in storage, not the filtered view.
- Example: 3 tasks (1 done, 2 active) → `"2 more to do, 1 done"`.

### 2. Add Task Form

| Element           | Property                                              |
| ----------------- | ----------------------------------------------------- |
| Input placeholder | `type to add new task`                                |
| Button label      | `Add task`                                            |
| Button style      | White background, blue border, blue text              |
| Submit triggers   | Button click; Enter key in input                      |
| Validation        | Empty/whitespace name → inline error, no task created |

After successful add: input clears; new task appears at bottom of list.

### 3. Search Bar


| Property    | Value                                                             |
| ----------- | ----------------------------------------------------------------- |
| Placeholder | `type to search task`                                             |
| Type        | Text input, full width minus filter group                         |
| Behavior    | Filters visible tasks by case-insensitive substring match on name |
| Debounce    | Optional; instant filter acceptable                               |


### 4. Filter Bar

Segmented button group with three options:


| Filter   | Label  | Shows                        |
| -------- | ------ | ---------------------------- |
| `all`    | All    | Every task                   |
| `active` | Active | Tasks where `done === false` |
| `done`   | Done   | Tasks where `done === true`  |


**Visual states**:

- **Active/selected filter**: Solid blue background (`#007bff` or equivalent), white text.
- **Inactive filter**: White background, grey border, dark text.
- Buttons share borders (joined segmented control).

Default on load: **All** selected.

### 5. Task List


| Property                 | Value                                                 |
| ------------------------ | ----------------------------------------------------- |
| Container                | Bordered box, light grey border                       |
| Row separator            | Thin horizontal line between rows                     |
| Scroll                   | Vertical scroll when content overflows; no pagination |
| Empty state (no tasks)   | Message e.g. "No tasks yet"                           |
| Empty state (no matches) | Message e.g. "No tasks match your search"             |


#### Task Row

Each row contains, left to right:


| Element               | Interaction                    | Visual states                                                 |
| --------------------- | ------------------------------ | ------------------------------------------------------------- |
| Task name             | Click toggles `done`           | See table below                                               |
| Delete button         | Click removes task permanently | Red border, trash icon, `aria-label="Delete task"`            |
| Mark Important button | Click toggles `important`      | Green border, exclamation icon, `aria-label="Mark important"` |


**Task name visual states** (combinable):


| State                          | Appearance                                  |
| ------------------------------ | ------------------------------------------- |
| Normal (active, not important) | Standard black text                         |
| Done                           | Strikethrough on name (e.g. "Drink Coffee") |
| Important (not done)           | Bold blue text (e.g. "Have a lunch")        |
| Done + Important               | Strikethrough **and** bold blue             |


Buttons remain the same icon style in all states.

### 6. Persistence Error Banner (conditional)


| Property   | Value                                             |
| ---------- | ------------------------------------------------- |
| Visibility | Shown when IndexedDB write fails                  |
| Content    | User-readable error message                       |
| Dismiss    | Optional close button                             |
| Style      | Distinct from normal UI (e.g. red/warning banner) |


## Interaction Contract


| #    | Trigger                          | Effect                                                             |
| ---- | -------------------------------- | ------------------------------------------------------------------ |
| I-01 | Click `Add task` with valid name | Create task, append to list, persist, clear input                  |
| I-02 | Click `Add task` with empty name | Show validation; no create                                         |
| I-03 | Click task name                  | Toggle `done` state; persist; update styling                       |
| I-04 | Click Delete                     | Remove task; persist; update list and counts                       |
| I-05 | Click Mark Important             | Toggle `important`; persist; update styling                        |
| I-06 | Type in search                   | Filter visible rows (intersect with active filter)                 |
| I-07 | Click filter button              | Set filter; update visible rows                                    |
| I-08 | Page load                        | Restore tasks from IndexedDB; reset filter to All, search to empty |


## Filter + Search Intersection

Both criteria apply simultaneously:

- Filter **Active** + search `"lunch"` → only active tasks whose name contains "lunch".
- Filter **Done** + search `"coffee"` → only done tasks matching "coffee".
- Screenshot reference: Done filter shows only "Drink Coffee" (strikethrough).

## Accessibility Requirements

- Tab order: add input → add button → search → filters → task rows (name, delete, important).
- Task name toggle: activatable via keyboard when focused (Enter/Space).
- All icon buttons MUST have `aria-label`.
- Filter group: `role="group"` with `aria-label="Filter tasks"`.

## Out of Scope (UI)

- Pagination, infinite scroll, virtualization
- Drag-and-drop reorder
- Edit-in-place task renaming (not in spec)
- Dark mode
- Mobile-specific layout (responsive reflow acceptable but no separate mobile design)

## Color Reference (approximate from screenshots)


| Token                | Usage                                            | Approximate value |
| -------------------- | ------------------------------------------------ | ----------------- |
| `--color-primary`    | Active filter, important text, add button border | `#007bff`         |
| `--color-text`       | Body text                                        | `#212529`         |
| `--color-text-muted` | Status summary                                   | `#6c757d`         |
| `--color-border`     | Inputs, list container                           | `#ced4da`         |
| `--color-danger`     | Delete button border/icon                        | `#dc3545`         |
| `--color-success`    | Important button border/icon                     | `#28a745`         |
| `--color-bg`         | Page background                                  | `#ffffff`         |


Exact hex values MAY vary slightly; relative hierarchy (blue primary, red delete, green important) MUST be preserved.