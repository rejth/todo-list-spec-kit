import { BaseStore } from "tiny-idb-store";

export class TasksStore extends BaseStore {
  constructor(db: IDBDatabase) {
    super(db, "tasks");
  }
}
