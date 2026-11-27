import { defineConfig } from "vitest/config";

// base "./": de app werkt in elke map, ook op GitHub Pages
// (https://<gebruiker>.github.io/typcursus-azerty/).
export default defineConfig({
  base: "./",
  build: { target: "es2022" },
  test: { include: ["tests/**/*.test.ts"] },
});
