# Feature Specification: Local-First To-Do App

**Feature Branch**: `001-local-todo-app`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Local-first To-Do app. Simple list of tasks, no pagination or virtualization. Each task has a name and two buttons in a row: Delete and Mark Important. When clicking on task name, it is marked done. Search input. Three filters: All, Done, Active. Input for adding a new task + Add button. Local persistance in a browser storage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and View Tasks (Priority: P1)

A user opens the app and wants to capture tasks quickly. They type a task name
into the add-task input, click Add, and see the new task appear in a simple
flat list. When they close and reopen the browser, all tasks are still there.

**Why this priority**: Without the ability to add, view, and retain tasks, the
app delivers no value. This is the minimum viable product.

**Independent Test**: Add three tasks, refresh the page, and confirm all three
tasks appear in the same order. Delivers a working task list with persistence.

**Acceptance Scenarios**:

1. **Given** an empty task list, **When** the user enters "Buy milk" and clicks
   Add, **Then** "Buy milk" appears as a new row in the list.
2. **Given** a list with existing tasks, **When** the user adds another task,
   **Then** the new task appears at the end of the list without removing
   existing tasks.
3. **Given** a list with tasks, **When** the user refreshes or reopens the
   browser, **Then** all previously added tasks are restored.
4. **Given** the add-task input is empty or contains only whitespace, **When**
   the user clicks Add, **Then** no task is created and the user receives
   feedback that a name is required.

---

### User Story 2 - Complete Tasks (Priority: P2)

A user wants to track progress by marking tasks as done. They click a task name
to toggle its done state. Done tasks are visually distinct from active tasks.

**Why this priority**: Completing tasks is the core loop of a to-do app, second
only to creating them.

**Independent Test**: Add two tasks, click one task name to mark it done, confirm
visual change and that toggling again restores it to active. Delivers task
completion tracking.

**Acceptance Scenarios**:

1. **Given** an active task, **When** the user clicks the task name, **Then**
   the task is marked as done and displayed with a clear visual distinction
   (e.g., strikethrough or muted styling).
2. **Given** a done task, **When** the user clicks the task name again,
   **Then** the task returns to active state with normal styling.
3. **Given** multiple tasks in mixed states, **When** the user marks one done,
   **Then** only that task changes state; others remain unchanged.

---

### User Story 3 - Delete and Mark Important (Priority: P3)

A user wants to remove tasks they no longer need and highlight tasks that
matter most. Each task row shows Delete and Mark Important buttons alongside
the task name.

**Why this priority**: Delete and prioritization are essential management actions
but the app remains usable without them if users can add and complete tasks.

**Independent Test**: Add a task, click Mark Important and confirm visual
change; click Delete and confirm the task is removed from the list and does not
reappear after refresh. Delivers task cleanup and prioritization.

**Acceptance Scenarios**:

1. **Given** a task in the list, **When** the user clicks Delete, **Then** the
   task is removed immediately and does not reappear after page refresh.
2. **Given** an active task, **When** the user clicks Mark Important, **Then**
   the task is visually marked as important.
3. **Given** an important task, **When** the user clicks Mark Important again,
   **Then** the important mark is removed (toggle behavior).
4. **Given** a done task marked important, **When** the user views the task,
   **Then** both done and important visual states are visible simultaneously.

---

### User Story 4 - Search and Filter Tasks (Priority: P4)

A user with many tasks wants to find specific items quickly. They type in the
search input to narrow results by task name and use All, Done, or Active
filters to view subsets of their list.

**Why this priority**: Search and filtering improve usability at scale but are
not required for a small list to function.

**Independent Test**: Create tasks in mixed done/active states, apply each
filter and confirm correct subset; type a search term and confirm only matching
tasks appear. Delivers discoverability for larger lists.

**Acceptance Scenarios**:

1. **Given** tasks in mixed states, **When** the user selects the Active
   filter, **Then** only non-done tasks are shown.
2. **Given** tasks in mixed states, **When** the user selects the Done filter,
   **Then** only done tasks are shown.
3. **Given** any task states, **When** the user selects the All filter, **Then**
   every task is shown regardless of done state.
4. **Given** a search term matching one or more task names, **When** the user
   types in the search input, **Then** only tasks whose names contain the
   search term (case-insensitive) are displayed.
5. **Given** an active filter and a search term, **When** both are applied,
   **Then** only tasks matching both the filter and the search term are shown.
6. **Given** a search term matching no tasks, **When** the user searches,
   **Then** the list shows an empty state message indicating no matches.

---

### Edge Cases

- What happens when the user adds a task with leading/trailing whitespace?
  Whitespace is trimmed; the trimmed name is stored and displayed.
- What happens when two tasks have identical names? Both are allowed; each
  remains a distinct task with independent state.
- What happens when browser storage is full or unavailable? The user sees a
  clear error message; existing in-memory tasks remain usable for the session
  but changes may not persist.
- What happens when the user clicks Delete on the last visible task while a
  filter or search is active? The task is removed from storage; the list updates
  to reflect the empty filtered view.
- What happens with a very long task name? The full name is stored; the UI
  wraps or truncates display without breaking the row layout (Delete and Mark
  Important buttons remain accessible).
- What happens when the list contains hundreds of tasks? All tasks render in a
  single scrollable list with no pagination or virtualization, per scope
  constraint.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a text input and Add button for creating new
  tasks.
- **FR-002**: System MUST reject task creation when the name is empty or
  whitespace-only and MUST inform the user.
- **FR-003**: System MUST display all tasks in a single flat list with no
  pagination or virtualization.
- **FR-004**: Each task row MUST show the task name, a Delete button, and a
  Mark Important button arranged in one row.
- **FR-005**: System MUST toggle a task's done state when the user clicks the
  task name.
- **FR-006**: System MUST visually distinguish done tasks from active tasks.
- **FR-007**: System MUST remove a task permanently when the user clicks Delete.
- **FR-008**: System MUST toggle a task's important state when the user clicks
  Mark Important and MUST visually indicate important tasks.
- **FR-009**: System MUST provide a search input that filters visible tasks by
  name (case-insensitive substring match).
- **FR-010**: System MUST provide three filters — All, Done, Active — where
  Active shows non-done tasks, Done shows completed tasks, and All shows every
  task.
- **FR-011**: System MUST apply search and filter criteria together (intersection).
- **FR-012**: System MUST persist all task data in browser-local storage so
  tasks survive page refresh and browser restart on the same device and browser.
- **FR-013**: System MUST restore persisted tasks when the app loads.
- **FR-014**: System MUST notify the user when persistence fails instead of
  failing silently.
- **FR-015**: System MUST trim leading and trailing whitespace from task names
  before saving.

### Key Entities

- **Task**: A single to-do item with a unique identifier, display name, done
  flag (boolean), and important flag (boolean). Tasks belong to one flat list
  with no categories or sub-lists.
- **Filter State**: The currently selected view filter (All, Done, or Active).
  Not persisted across sessions; defaults to All on load.
- **Search Query**: The current text in the search input. Not persisted across
  sessions; defaults to empty on load.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a new task and see it in the list within 2 seconds
  of clicking Add.
- **SC-002**: 100% of tasks added in a session are present after a page
  refresh under normal browser storage conditions.
- **SC-003**: Users can find a specific task by name using search in under
  5 seconds for lists up to 200 tasks.
- **SC-004**: Each core action (add, complete, delete, mark important, filter,
  search) completes with visible feedback in under 1 second on lists up to
  200 tasks.
- **SC-005**: 95% of first-time users can add a task, mark it done, and find
  it using the Active/Done filters without instructions.

## Assumptions

- Single-user, single-device usage; no account system, sync, or multi-device
  sharing in this feature.
- One flat task list; no projects, categories, due dates, or subtasks.
- Clicking the task name toggles done/active (standard to-do behavior); a second
  click restores the task to active.
- Mark Important is a visual priority flag only; it does not affect filter
  logic (All/Done/Active filters apply solely to done state).
- Search and filter state reset to defaults (All, empty search) on each page
  load.
- Duplicate task names are permitted.
- No maximum task count is enforced beyond practical browser storage limits;
  the UI renders all tasks in one scrollable list without pagination.
- The app runs entirely in the browser with no server dependency after initial
  load.
