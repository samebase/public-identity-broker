import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    printWidth: 100,
    proseWrap: "always",
  },
  lint: {
    options: { typeAware: true },
    plugins: ["eslint", "typescript"],
    env: { builtin: true },
    rules: {
      "typescript/no-floating-promises": "error",
      "typescript/no-deprecated": "error",
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
