import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
  pack: [
    {
      entry: ["src/lib/index.ts"],
      format: ["esm", "cjs", "umd"],
      globalName: "demTiles",
      platform: "browser",
      dts: true,
      sourcemap: true,
      publint: true,
      attw: { profile: "strict" },
      deps: { onlyBundle: false },
    },
    {
      entry: ["src/lib/decoder.ts"],
      format: ["esm", "cjs"],
      platform: "browser",
      dts: true,
      sourcemap: true,
      clean: false,
      deps: { onlyBundle: false },
    },
  ],
  fmt: {
    ignorePatterns: ["CHANGELOG.md", "dist/**"],
  },
  lint: {
    plugins: ["oxc", "typescript", "unicorn"],
    categories: {
      correctness: "error",
    },
    env: {
      browser: true,
      node: true,
    },
    ignorePatterns: ["dist/**"],
    jsPlugins: [
      "@stylistic/eslint-plugin",
      { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
    ],
    rules: {
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "typescript/no-explicit-any": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let"], next: "*" },
        { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
        { blankLine: "always", prev: "*", next: "multiline-block-like" },
        { blankLine: "always", prev: "multiline-block-like", next: "*" },
      ],
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["src/**"],
    },
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
          typecheck: {
            enabled: true,
            include: ["tests/**/*.test.ts"],
            tsconfig: "./tests/tsconfig.json",
          },
        },
      },
      {
        test: {
          name: "browser",
          include: ["tests/browser/**/*.test.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: "chrome" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
