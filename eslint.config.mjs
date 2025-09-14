import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Project-wide ignores
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Override / relax specific noisy rules to avoid build friction.
    rules: {
      // Allow temporary use of 'any' (still surfaces as a warning if set to 'warn').
      '@typescript-eslint/no-explicit-any': 'off',
      // Permit unused vars that are intentionally prefixed with _ (common pattern for placeholders)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
    },
  },
];

export default eslintConfig;
