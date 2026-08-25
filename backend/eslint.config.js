// @ts-check
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Base TypeScript-aware config — parses .ts files correctly
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      // Warn on console.log in production code
      "no-console": "warn",
      // Allow unused vars that start with _ (common TypeScript convention)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow explicit `any` with a warning rather than hard error
      // (the codebase uses any in several places intentionally)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow require() in .ts files (used in dynamic imports)
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Ignore build output and dependencies
    ignores: ["dist/**", "node_modules/**"],
  }
);
