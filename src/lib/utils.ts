import shell from 'shelljs';
import fs from 'node:fs/promises';

import { logger } from './logger';
import { rootDir } from './dir';
import { Check, PackageManager, PackageManagerEnum } from '../types';

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
		logger.error('Cannot clone the repository');
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

export function updatePackageJSON(
	packageName: string,
	packageVersion: string,
	pth: string
) {
	shell.cd(pth);

	if (shell.test('-e', './package.json')) {
		logger.info('Updating "package.json"');
		shell.ls('package.json').forEach((file) => {
			shell.sed(
				'-i',
				/"name":\s*"(.*?)"/gi,
				`"name": "${packageName}"`,
				file
			);
			shell.sed(
				'-i',
				/"version":\s*"(.*?)"/gi,
				`"version": "${packageVersion}"`,
				file
			);
		});
	} else {
		logger.warn('File not found: package.json');
	}

	if (shell.test('-e', './package-lock.json')) {
		logger.info('Updating "package-lock.json"');
		shell.ls('package-lock.json').forEach((file) => {
			shell.sed(
				'-i',
				/"name":\s*"(.*?)"/i,
				`"name": "${packageName}"`,
				file
			);
			shell.sed(
				'-i',
				/"version":\s*"(.*?)"/i,
				`"version": "${packageVersion}"`,
				file
			);
		});
	} else {
		logger.warn('File not found: package-lock.json');
	}
}

export function installDeps(packageManager: PackageManager, pth: string) {
	shell.cd(pth);
	// TODO: pick the package manager automaticly (support npm, pnpm, yarn & bun)

	switch (packageManager) {
		// TODO: support other package managers as well
		case PackageManagerEnum.npm: {
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

		case PackageManagerEnum.yarn: {
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

		case PackageManagerEnum.pnpm: {
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
		case PackageManagerEnum.bun: {
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
			logger.error('Invalid package manager');
			logger.error('You need to install dependencies manually!');
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
		'npm install -D eslint eslint-config-prettier eslint-config-airbnb-base eslint-plugin-prettier eslint-plugin-import eslint-plugin-import-resolver-typescript @typescript-eslint/eslint-plugin prettier eslint-config-airbnb-typescript @typescript-eslint/parser'
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
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
		'[IMPORTANT] You should install "eslint" and "prettier" extensions to get better experience'
	);
	logger.info('E.P.A installed and configured successfully');
	logger.info('Done, now you can run "npm run fix" command!');
}

export async function initEPAForJS(pth: string) {
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

	logger.info('Installing E.P.A (for JavaScript)');

	// TODO: check if package.json or the package managers configs exists or not

	logger.info('Installing packages...');
	shell.exec(
		'npm install -D eslint eslint-config-prettier eslint-config-airbnb-base eslint-plugin-prettier eslint-plugin-import prettier'
	);

	shell.exec('npm i --save');

	logger.info('Packages installed');

	logger.info('Creating .eslintrc.js file');

	const eslintRcTemplate = await fs.readFile(
		`${rootDir}/templates/javascript/.eslintrc.js`,
		'utf8'
	);
	await fs.writeFile('.eslintrc.js', eslintRcTemplate);

	logger.info('Creating prettier.config.js file');
	const prettierRcTemplate = await fs.readFile(
		`${rootDir}/templates/javascript/prettier.config.js`,
		'utf8'
	);
	await fs.writeFile('prettier.config.js', prettierRcTemplate);

	const eslintIgnoreTemplate = await fs.readFile(
		`${rootDir}/templates/javascript/.eslintignore`,
		'utf8'
	);
	await fs.writeFile('.eslintignore', eslintIgnoreTemplate);

	logger.info('Pushing "fix" script to package.json');
	const packageContent = await fs.readFile('package.json', 'utf8');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
		'[IMPORTANT] You should install "eslint" and "prettier" extensions to get better experience'
	);
	logger.info('E.P.A installed and configured successfully');
	logger.info('Done, now you can run "npm run fix" command!');
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
		if (error?.code === 'ENOENT') {
			return false;
		}
		// TODO:
		return false;
	}
}
