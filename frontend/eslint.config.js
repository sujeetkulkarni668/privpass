// @ts-check
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Base TypeScript-aware config — parses .ts and .tsx files correctly
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Allow unused vars that start with _ (common TypeScript/React convention)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow explicit `any` with a warning (codebase uses any intentionally in several places)
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Ignore build output and dependencies
    ignores: ["dist/**", "node_modules/**"],
  }
);
