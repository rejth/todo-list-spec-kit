import { describe, expect, it } from "vitest";
import { getStatusSummary, getVisibleTasks } from "../../src/lib/filters";
import type { Task } from "../../src/types/task";

let nextId = 1;
function task(partial: Partial<Task>): Task {
  return {
    id: nextId++,
    name: "t",
    done: false,
    important: false,
    createdAt: nextId,
    ...partial,
  };
}

describe("getStatusSummary", () => {
  it("counts active and done tasks", () => {
    const tasks = [task({ done: false }), task({ done: true }), task({ done: false })];
    expect(getStatusSummary(tasks)).toEqual({ active: 2, done: 1 });
  });

  it("returns zeros for an empty list", () => {
    expect(getStatusSummary([])).toEqual({ active: 0, done: 0 });
  });
});

describe("getVisibleTasks", () => {
  it("active filter shows only non-done tasks", () => {
    const tasks = [task({ name: "a", done: false }), task({ name: "b", done: true })];
    expect(getVisibleTasks(tasks, "active", "").map((t) => t.name)).toEqual(["a"]);
  });

  it("done filter shows only done tasks", () => {
    const tasks = [task({ name: "a", done: false }), task({ name: "b", done: true })];
    expect(getVisibleTasks(tasks, "done", "").map((t) => t.name)).toEqual(["b"]);
  });

  it("all filter shows every task", () => {
    const tasks = [task({ name: "a", done: false }), task({ name: "b", done: true })];
    expect(getVisibleTasks(tasks, "all", "").map((t) => t.name)).toEqual(["a", "b"]);
  });

  it("search matches case-insensitive substrings", () => {
    const tasks = [task({ name: "Drink Coffee" }), task({ name: "Walk dog" })];
    expect(getVisibleTasks(tasks, "all", "COFFEE").map((t) => t.name)).toEqual(["Drink Coffee"]);
  });

  it("applies filter and search as an intersection", () => {
    const tasks = [
      task({ name: "Drink Coffee", done: true }),
      task({ name: "Coffee break", done: false }),
    ];
    expect(getVisibleTasks(tasks, "done", "coffee").map((t) => t.name)).toEqual(["Drink Coffee"]);
  });

  it("returns an empty list with no matches and does not throw", () => {
    const tasks = [task({ name: "a" })];
    expect(getVisibleTasks(tasks, "all", "zzz")).toEqual([]);
  });
});
