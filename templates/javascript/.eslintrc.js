/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
	env: {
		browser: false,
		node: true,
	},
	root: true,
	extends: [
		'eslint:recommended',
		'airbnb-base',
		'plugin:import/recommended',
		'prettier',
	],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['prettier'],
	rules: {
		'no-prototype-builtins': 'off',
		'import/prefer-default-export': 'off',
		'import/no-default-export': 'off',
		'no-use-before-define': [
			'error',
			{ functions: false, classes: true, variables: true },
		],
		'prettier/prettier': 'error',
	},
};
