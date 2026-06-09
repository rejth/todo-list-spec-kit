import { Show } from "solid-js";
import { persistenceError } from "../stores/taskStore";

/** Non-blocking banner shown when a persistence write fails. */
export function ErrorBanner() {
  return (
    <Show when={persistenceError()}>
      {(message) => (
        <div class="error-banner" role="alert">
          {message()}
        </div>
      )}
    </Show>
  );
}
