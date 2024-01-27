/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  root: true,
  plugins: ["@typescript-eslint"],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',

  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {},
  env: {
    node: true,
  },
};
