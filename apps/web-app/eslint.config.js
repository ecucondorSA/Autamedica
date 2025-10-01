import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import next from "@next/eslint-plugin-next";

export default tseslint.config(
  { ignores: ["**/node_modules/**", ".next/**", "out/**", "dist/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": hooks, "@next/next": next },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
    }
  }
);
