import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TasksStore } from "../../src/lib/storage/TasksStore";
import {
  addTask,
  deleteTask,
  initTaskStore,
  persistenceError,
  resetTaskStore,
  tasks,
  toggleDone,
  toggleImportant,
} from "../../src/stores/taskStore";

describe("taskStore.addTask", () => {
  beforeEach(async () => {
    resetTaskStore();
    await initTaskStore();
  });

  it("addTask makes task appear in tasks list", async () => {
    await addTask("Buy milk");

    expect(tasks().map((t) => t.name)).toEqual(["Buy milk"]);
    expect(tasks()[0]).toMatchObject({ done: false, important: false });
  });

  it("addTask rejects empty or whitespace-only name", async () => {
    await addTask("");
    await addTask("   ");

    expect(tasks()).toHaveLength(0);
  });

  it("addTask trims leading and trailing whitespace", async () => {
    await addTask("  Walk dog  ");
    expect(tasks()[0].name).toBe("Walk dog");
  });

  it("duplicate names create distinct tasks", async () => {
    await addTask("same");
    await addTask("same");
    const ids = tasks().map((t) => t.id);

    expect(tasks()).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

describe("taskStore.toggleDone", () => {
  beforeEach(async () => {
    resetTaskStore();
    await initTaskStore();
  });

  it("toggleDone flips done flag and persists", async () => {
    await addTask("Drink coffee");
    const id = tasks()[0].id;

    await toggleDone(id);
    expect(tasks()[0].done).toBe(true);

    // Survives a reload.
    resetTaskStore();
    await initTaskStore();
    expect(tasks()[0].done).toBe(true);
  });

  it("toggleDone affects only the targeted task", async () => {
    await addTask("One");
    await addTask("Two");
    const [first, second] = tasks();

    await toggleDone(second.id);

    expect(tasks().find((t) => t.id === first.id)?.done).toBe(false);
    expect(tasks().find((t) => t.id === second.id)?.done).toBe(true);
  });
});

describe("taskStore.deleteTask", () => {
  beforeEach(async () => {
    resetTaskStore();
    await initTaskStore();
  });

  it("deleteTask removes task and persists", async () => {
    await addTask("Keep");
    await addTask("Remove");
    const removeId = tasks().find((t) => t.name === "Remove")?.id as number;

    await deleteTask(removeId);
    expect(tasks().map((t) => t.name)).toEqual(["Keep"]);

    // Gone after reload.
    resetTaskStore();
    await initTaskStore();
    expect(tasks().map((t) => t.name)).toEqual(["Keep"]);
  });
});

describe("taskStore.toggleImportant", () => {
  beforeEach(async () => {
    resetTaskStore();
    await initTaskStore();
  });

  it("toggleImportant flips flag and persists", async () => {
    await addTask("Have a lunch");
    const id = tasks()[0].id;

    await toggleImportant(id);
    expect(tasks()[0].important).toBe(true);

    resetTaskStore();
    await initTaskStore();
    expect(tasks()[0].important).toBe(true);
  });
});

describe("taskStore persistence errors", () => {
  beforeEach(async () => {
    resetTaskStore();
    await initTaskStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persistence failure sets persistenceError", async () => {
    vi.spyOn(TasksStore.prototype, "add").mockRejectedValueOnce(new Error("disk full"));
    await addTask("Will fail");
    expect(persistenceError()).toBe("disk full");
  });
});
