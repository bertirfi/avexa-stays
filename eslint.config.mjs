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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Prototipuri statice legacy din root (pre-Next.js) — nu se lintează
      "*.js",
      "*.jsx",
      "listing-*/**",
      "listing-photos/**",
      "public/**",
      "uploads/**",
      "screenshots/**",
      "chats/**",
      "project/**",
      "thoughts/**",
      ".claude/**",
      ".agents/**",
    ],
  },
];

export default eslintConfig;
