import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "playwright-report", "test-results", "public", "src/content/pages"]),
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Les couleurs passent par les tokens (tokens.css) : jamais de hex en dur dans les composants.
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Couleur en dur interdite : utiliser une classe Tailwind issue des tokens (bg-action, text-muted…).",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.ts", "tests/**/*.ts", "*.config.{ts,js}"],
    extends: [js.configs.recommended, tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
  },
]);
