import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/website/unit/**/*.test.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/gatedAssetBuildArtifact.test.ts",
      "**/*.spec.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
