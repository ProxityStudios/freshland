import shell from 'shelljs';
import fs from 'node:fs/promises';

import { logger } from './logger';
import { rootDir } from '../dir';

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

	deleteAndInitGit(destination);
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

	if (shell.exec(`git commit -am "Auto-commit by Freshland"`).code !== 0) {
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
			shell.sed('-i', /"version":\s*"(.*?)"/gi, `"version": "1.0.0"`, file);
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
			shell.sed('-i', /"version":\s*"(.*?)"/i, `"version": "1.0.0"`, file);
		});
	}
}

export enum PackageManager {
	npm = 'npm',
	pnpm = 'pnpm',
	yarn = 'yarn',
	bun = 'bun',
}
type PackageManagerKeys = keyof typeof PackageManager;

export function installDeps(
	packageManager: PackageManagerKeys,
	projectName: string,
	pth: string
) {
	shell.cd(pth);
	// TODO: pick the package manager automaticly (support npm, pnpm, yarn & bun)

	if (packageManager === PackageManager.npm) {
		updatePackageJSON(projectName, pth);

		if (!shell.which('npm')) {
			logger.error('Sorry, you need to install "npm" first');
			return;
		}

		logger.info('Installing dependencies...');
		if (shell.exec('npm install').code === 0) {
			logger.info('Dependencies installed');
		} else {
			logger.error('"npm install" command failed');
			logger.warn('You need to install dependencies manually!');
		}
	}

	// TODO: support other package managers
}

export async function installEPAForTS(pth: string) {
	logger.info('Installing EPA (for TypeScript)');

	const directoryExists = await checkIfDirectoryExists(pth);

	if (directoryExists) {
		shell.cd(pth);
	} else {
		logger.error('Directory not exists. Exiting...');
		shell.exit(1);
	}

	// TODO: check if package.json or the package managers configs exists or not
	shell.exec('npm install', { async: true });
	logger.info('Dependencies installed');

	logger.info('Installing packages');
	shell.exec(
		'npm install --save-dev eslint eslint-config-prettier @typescript-eslint/eslint-plugin prettier eslint-config-prettier',
		{ async: true }
	);

	shell.exec('npx install-peerdeps --dev eslint-config-airbnb-base', {
		async: true,
	});

	shell.exec(
		'npm install eslint-config-airbnb-typescript @typescript-eslint/eslint-plugin@^6.0.0 @typescript-eslint/parser@^6.0.0 --save-dev'
	);

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

	logger.info('Pushing "fix" script to package.json');
	const packagePath = `${process.cwd()}/package.json`;
	const packageContent = await fs.readFile(packagePath, 'utf8');
	const packageJSON: any = JSON.parse(packageContent);

	packageJSON.scripts = {
		...packageJSON.scripts,
		fix: 'eslint . --fix',
	};

	await fs.writeFile(
		packagePath,
		JSON.stringify(packageJSON, undefined, 2),
		'utf8'
	);

	logger.warn(
		'[IMPORTANT] To get better experience, install "eslint" and "prettier" extensions'
	);
	logger.info('E.P.A installed and configured successfully');
}

export function installEPAForJS() {
	logger.info('Installing EPA (for JavaScript)');
}

async function checkIfDirectoryExists(directoryPath: string) {
	try {
		const stats = await fs.stat(directoryPath);
		return stats.isDirectory();
	} catch (error: any) {
		if (error.code === 'ENOENT') {
			return false;
		}
		// TODO:
		return false;
	}
}
