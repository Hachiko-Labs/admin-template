import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = [
  {
    ignores: ["src/components/ui/**", ".next-test/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    files: [
      "src/lib/document-editor/**/*.{ts,tsx}",
      "src/lib/editorial-layout/**/*.{ts,tsx}",
      "src/lib/image-editor/**/*.{ts,tsx}",
      "src/lib/interface-designer/**/*.{ts,tsx}",
      "src/lib/motion-designer/**/*.{ts,tsx}",
      "src/lib/photo-developer/**/*.{ts,tsx}",
      "src/lib/presentation-reference/**/*.{ts,tsx}",
      "src/lib/spreadsheet/**/*.{ts,tsx}",
      "src/lib/vector-animation/**/*.{ts,tsx}",
      "src/lib/vector-designer/**/*.{ts,tsx}",
      "src/lib/video-editor/**/*.{ts,tsx}",
      "src/lib/website-editor/**/*.{ts,tsx}",
    ],
    rules: {
      // These runtime engines were migrated from JavaScript in PR #38. Keep
      // their documented legacy typing/style debt isolated while the rest of
      // the repository continues to enforce the normal TypeScript rules.
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-unused-vars": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];

export default eslintConfig;
