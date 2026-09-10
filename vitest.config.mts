import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
      "@quhealthy/health-os-contract": path.resolve(
        import.meta.dirname,
        "./packages/health-os-contract/src/index.ts"
      ),
    },
  },
});
