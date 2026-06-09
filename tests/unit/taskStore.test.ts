import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TasksStore } from "../../src/lib/storage/TasksStore";
import {
  addTask,
  initTaskStore,
  persistenceError,
  resetTaskStore,
  tasks,
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
