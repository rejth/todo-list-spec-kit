/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root not found");
}

// Minimal placeholder mount. Full <App /> shell arrives in Phase 2 (T002).
render(() => <main class="app">To-Do List</main>, root);
