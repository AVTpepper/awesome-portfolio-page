import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Bypass server-only guard — tests run outside the Next.js server pipeline
      "server-only": path.resolve(__dirname, "./src/__mocks__/server-only.ts"),
      // Swap Next.js modules for lightweight test doubles
      "next/link": path.resolve(__dirname, "./src/__mocks__/next-link.tsx"),
      "next/image": path.resolve(__dirname, "./src/__mocks__/next-image.tsx"),
    },
  },
});
