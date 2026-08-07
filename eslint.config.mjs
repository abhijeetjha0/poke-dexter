import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0, "maxBOF": 0 }],
      "react/forbid-dom-props": ["error", { "forbid": ["style"] }],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "destructuredArrayIgnorePattern": "^_", "caughtErrors": "none" }],
      "space-before-blocks": ["error", "always"],
      "padding-line-between-statements": [
        "error",
        { "blankLine": "always", "prev": "*", "next": ["return", "block-like"] },
        { "blankLine": "always", "prev": "block-like", "next": "*" }
      ],
      "curly": ["error", "all"],
      "max-len": ["error", { "code": 120, "ignoreUrls": true, "ignoreStrings": true, "ignoreTemplateLiterals": true, "ignoreRegExpLiterals": true }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "coverage/**",
      "**/node_modules/**",
      "package-lock.json",
      "**/*.md",
      "**/*.txt",
      "**/*.json",
      "**/*.css",
      "**/*.scss",
      "**/*.svg",
      "PR/**",
      "browser-reports/**"
    ],
  }
];
