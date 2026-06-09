import { TasksStore } from "./TasksStore";

const DB_NAME = "todo-db";
const DB_VERSION = 1;
const STORE_NAME = "tasks";

export class StorageService {
  private static instance: StorageService | null = null;

  private db: IDBDatabase | null = null;
  private tasksStore: TasksStore | null = null;

  private constructor() {}

  get tasks(): TasksStore {
    if (!this.tasksStore) {
      throw new Error("StorageService is not initialized.");
    }
    return this.tasksStore;
  }

  static async create(): Promise<StorageService> {
    if (StorageService.instance) {
      return StorageService.instance;
    }
    const instance = new StorageService();
    await instance.initialize();
    StorageService.instance = instance;
    return instance;
  }

  static reset(): void {
    StorageService.instance?.db?.close();
    StorageService.instance = null;
  }

  private async initialize(): Promise<void> {
    this.db = await this.openConnection();
    this.tasksStore = new TasksStore(this.db);
  }

  private openConnection(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const connection = indexedDB.open(DB_NAME, DB_VERSION);

      connection.addEventListener("upgradeneeded", (event: IDBVersionChangeEvent) => {
        const request = event.target as IDBOpenDBRequest;
        const db = request.result;
        if (event.oldVersion === 0) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      });

      connection.addEventListener(
        "success",
        () => {
          const db = connection.result;
          db.addEventListener("versionchange", () => db.close());
          resolve(db);
        },
        { once: true },
      );

      connection.addEventListener("error", () => reject(connection.error), { once: true });
    });
  }
}
