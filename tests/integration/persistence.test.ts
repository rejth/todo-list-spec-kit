import { beforeEach, describe, expect, it } from "vitest";
import { addTask, initTaskStore, resetTaskStore, tasks } from "../../src/stores/taskStore";

describe("persistence", () => {
  beforeEach(async () => {
    resetTaskStore();
    await initTaskStore();
  });

  it("initTaskStore restores tasks after StorageService re-create", async () => {
    await addTask("Persisted task");
    expect(tasks()).toHaveLength(1);

    // Simulate a page reload: drop the in-memory state and the cached service,
    // then re-open the same IndexedDB database.
    resetTaskStore();
    expect(tasks()).toHaveLength(0);

    await initTaskStore();
    expect(tasks().map((t) => t.name)).toEqual(["Persisted task"]);
  });
});
