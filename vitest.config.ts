import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    // tiny-idb-store ships extensionless ESM imports; inline it so Vite resolves them.
    server: {
      deps: {
        inline: ["tiny-idb-store"],
      },
    },
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
