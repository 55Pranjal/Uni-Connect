import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "server/node_modules", "node_modules"]),

  // ─── Frontend (browser, React) ─────────────────────────────────────────
  {
    files: ["src/**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Underscore-prefixed args / vars are intentionally unused.
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" },
      ],

      // Context files legitimately export `useFoo()` hooks + small KEY
      // constants alongside the Provider. Allow constant exports so Fast
      // Refresh stays happy without splitting every context into 3 files.
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // New in eslint-plugin-react-hooks v7. Flags every synchronous
      // setState in a useEffect — including the legitimate "reset on
      // dependency change" pattern (e.g. `useEffect(() => setOpen(false),
      // [location.pathname])`). Keep visible as a warning so the genuinely
      // problematic ones are findable, but don't fail CI on them.
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  // ─── Backend (Node, no JSX) ─────────────────────────────────────────────
  {
    files: ["server/**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" },
      ],
    },
  },
]);
