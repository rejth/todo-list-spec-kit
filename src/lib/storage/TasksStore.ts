import { BaseStore } from "tiny-idb-store";

/** IndexedDB object store for Task records. CRUD via inherited BaseStore methods. */
export class TasksStore extends BaseStore {
  constructor(db: IDBDatabase) {
    super(db, "tasks");
  }
}
