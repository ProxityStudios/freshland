/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
  ],
  rules: {},
  env: {
    node: true,
  },
};
