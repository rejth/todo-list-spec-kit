import { describe, expect, it } from "vitest";
import { getStatusSummary } from "../../src/lib/filters";
import type { Task } from "../../src/types/task";

function task(partial: Partial<Task>): Task {
  return { id: 1, name: "t", done: false, important: false, createdAt: 1, ...partial };
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
