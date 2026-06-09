import { beforeEach, describe, expect, it } from "vitest";
import { StorageService } from "../../src/lib/storage/StorageService";
import type { NewTask, Task } from "../../src/types/task";

function makeTask(name: string): NewTask {
  return { name, done: false, important: false, createdAt: 1 };
}

describe("TasksStore", () => {
  let service: StorageService;

  beforeEach(async () => {
    StorageService.reset();
    service = await StorageService.create();
  });

  it("add makes task retrievable by id", async () => {
    const id = await service.tasks.add(makeTask("Buy milk"));
    const task = await service.tasks.get(id);
    expect(task).toMatchObject({ id, name: "Buy milk", done: false });
  });

  it("getAll returns stored tasks", async () => {
    await service.tasks.add(makeTask("One"));
    await service.tasks.add(makeTask("Two"));
    const all = await service.tasks.getAll<Task>();
    expect(all.map((t) => t.name)).toEqual(["One", "Two"]);
  });

  it("update patches task fields", async () => {
    const id = await service.tasks.add(makeTask("Toggle me"));
    const ok = await service.tasks.update(id, { done: true, important: true });
    expect(ok).toBe(true);
    const task = await service.tasks.get<Task>(id);
    expect(task).toMatchObject({ done: true, important: true });
  });

  it("delete removes task from getAll", async () => {
    const id = await service.tasks.add(makeTask("Remove me"));
    await service.tasks.delete(id);
    const all = await service.tasks.getAll<Task>();
    expect(all).toEqual([]);
  });
});
