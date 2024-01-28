import shell from 'shelljs';
import fs from 'node:fs/promises';

import { logger } from './logger';
import { rootDir } from './dir';
import { Check, PackageManager } from '../types';

export function cloneGithubRepo(repo: string, destination: string) {
	if (!shell.which('git')) {
		logger.error('Sorry, this script requires "git"');
		shell.exit(1);
	}

	let repoURI = `https://github.com/${repo}`;

	if (repo.startsWith('http') || repo.startsWith('git@')) {
		repoURI = repo;
	}

	logger.info('Cloning into', destination);
	if (shell.exec(`git clone ${repoURI} ${destination}`).code !== 0) {
		logger.error('Cannot clone the repo');
		shell.exit(1);
	}

	logger.info('Repo cloned');
}

export function deleteAndInitGit(pth: string) {
	shell.cd(pth);

	if (shell.rm('-rf', '.git/').code !== 0) {
		logger.error('Cannot delete ".git" folder');
		shell.exit(1);
	}

	logger.info('Initializing git');
	if (shell.exec('git init').code !== 0) {
		logger.error('"git init" command failed');
		shell.exit(1);
	}
	if (shell.exec('git add .').code !== 0) {
		logger.error('"git add" command failed');
		shell.exit(1);
	}

	if (shell.exec('git commit -am "Auto-commit by Freshland"').code !== 0) {
		logger.error('"git commit" command failed');
		shell.exit(1);
	}

	logger.info('Git initialized');
}

export function updatePackageJSON(projectName: string, pth: string) {
	shell.cd(pth);

	if (shell.test('-e', './package.json')) {
		logger.info('Updating "package.json"');
		shell.ls('package.json').forEach((file) => {
			shell.sed(
				'-i',
				/"name":\s*"(.*?)"/gi,
				`"name": "${projectName}"`,
				file
			);
			shell.sed('-i', /"version":\s*"(.*?)"/gi, '"version": "1.0.0"', file);
		});
	}

	if (shell.test('-e', './package-lock.json')) {
		logger.info('Updating "package-lock.json"');
		shell.ls('package-lock.json').forEach((file) => {
			shell.sed(
				'-i',
				/"name":\s*"(.*?)"/i,
				`"name": "${projectName}"`,
				file
			);
			shell.sed('-i', /"version":\s*"(.*?)"/i, '"version": "1.0.0"', file);
		});
	}
}

export function installDeps(
	packageManager: PackageManager,
	projectName: string,
	pth: string
) {
	shell.cd(pth);
	// TODO: pick the package manager automaticly (support npm, pnpm, yarn & bun)

	switch (packageManager) {
		// TODO: support other package managers

		case PackageManager.NPM: {
			updatePackageJSON(projectName, pth);

			if (!shell.which('npm')) {
				logger.error(
					'Sorry, you need to install "npm" to install dependencies'
				);
				return;
			}

			logger.info('Installing dependencies...');
			if (shell.exec('npm install').code === 0) {
				logger.info('Dependencies installed');
			} else {
				logger.error('"npm install" command failed');
				logger.warn('You need to install dependencies manually!');
			}
			break;
		}

		case PackageManager.YARN: {
			updatePackageJSON(projectName, pth);

			if (!shell.which('yarn')) {
				logger.error(
					'Sorry, you need to install "yarn" to install dependencies'
				);
				return;
			}

			logger.info('Installing dependencies...');
			if (shell.exec('yarn install').code === 0) {
				logger.info('Dependencies installed');
			} else {
				logger.error('"yarn install" command failed');
				logger.warn('You need to install dependencies manually!');
			}
			break;
		}

		case PackageManager.PNPM: {
			updatePackageJSON(projectName, pth);

			if (!shell.which('pnpm')) {
				logger.error(
					'Sorry, you need to install "pnpm" to install dependencies'
				);
				return;
			}

			logger.info('Installing dependencies...');
			if (shell.exec('pnpm install').code === 0) {
				logger.info('Dependencies installed');
			} else {
				logger.error('"pnpm install" command failed');
				logger.warn('You need to install dependencies manually!');
			}
			break;
		}
		case PackageManager.BUN: {
			updatePackageJSON(projectName, pth);

			if (!shell.which('bun')) {
				logger.error(
					'Sorry, you need to install "bun" to install dependencies'
				);
				return;
			}

			logger.info('Installing dependencies...');
			if (shell.exec('bun install').code === 0) {
				logger.info('Dependencies installed');
			} else {
				logger.error('"bun install" command failed');
				logger.warn('You need to install dependencies manually!');
			}
			break;
		}
		default: {
			break;
		}
	}
}

export async function initEPAForTS(pth: string) {
	const directoryExists = await checkIfExists(pth, Check.DIRECTORY);
	const packageJSONExists = await checkIfExists(
		`${pth}/package.json`,
		Check.FILE
	);

	if (directoryExists && packageJSONExists) {
		shell.cd(pth);
	} else {
		logger.error('Directory or "package.json" not exists. Exiting...');
		shell.exit(1);
	}

	logger.info('Installing E.P.A (for TypeScript)');

	// TODO: check if package.json or the package managers configs exists or not

	logger.info('Installing packages...');
	shell.exec(
		'npm install -D eslint eslint-config-prettier eslint-config-airbnb-base eslint-plugin-prettier eslint-plugin-import @typescript-eslint/eslint-plugin prettier eslint-config-airbnb-typescript @typescript-eslint/parser'
	);

	shell.exec('npm i --save');

	logger.info('Packages installed');

	logger.info('Creating .eslintrc.js file');

	const eslintRcTemplate = await fs.readFile(
		`${rootDir}/templates/typescript/.eslintrc.js`,
		'utf8'
	);
	await fs.writeFile('.eslintrc.js', eslintRcTemplate);

	logger.info('Creating prettier.config.js file');
	const prettierRcTemplate = await fs.readFile(
		`${rootDir}/templates/typescript/prettier.config.js`,
		'utf8'
	);
	await fs.writeFile('prettier.config.js', prettierRcTemplate);

	const eslintIgnoreTemplate = await fs.readFile(
		`${rootDir}/templates/typescript/.eslintignore`,
		'utf8'
	);
	await fs.writeFile('.eslintignore', eslintIgnoreTemplate);

	logger.info('Pushing "fix" script to package.json');
	const packageContent = await fs.readFile('package.json', 'utf8');
	const packageJSON: { scripts: object } = JSON.parse(packageContent);

	packageJSON.scripts = {
		...packageJSON.scripts,
		fix: 'eslint . --fix',
	};

	await fs.writeFile(
		'package.json',
		JSON.stringify(packageJSON, undefined, 2),
		'utf8'
	);

	logger.warn(
		'[IMPORTANT] To get better experience, install "eslint" and "prettier" extensions'
	);
	logger.info('E.P.A installed and configured successfully');
	logger.info('Now you can run "npm run fix" command');
}

export function initEPAForJS() {
	logger.info('Installing E.P.A (for JavaScript)');
}

async function checkIfExists(pth: string, type: Check) {
	try {
		const stats = await fs.stat(pth);
		switch (type) {
			case Check.DIRECTORY: {
				return stats.isDirectory();
			}

			case Check.FILE: {
				return stats.isFile();
			}
			// TODO: make this working
			/*
			case Check.VIDEO: {
				return stats.isFile();
			}

			case Check.IMAGE: {
				return stats.isDirectory();
			}
			*/

			default: {
				return false;
			}
		}
	} catch (error: any) {
		if (error.code === 'ENOENT') {
			return false;
		}
		// TODO:
		return false;
	}
}
