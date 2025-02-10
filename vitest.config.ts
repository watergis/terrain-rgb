import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    globals: true,
    environment: "jsdom",
  },
});
