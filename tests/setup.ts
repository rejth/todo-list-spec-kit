// Vitest global setup.
// Provides an in-memory IndexedDB implementation so storage code runs in Node.
import { IDBFactory } from "fake-indexeddb";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Reset to a fresh in-memory IndexedDB between tests for isolation.
afterEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

// Seed the initial factory before any test runs.
globalThis.indexedDB = new IDBFactory();
