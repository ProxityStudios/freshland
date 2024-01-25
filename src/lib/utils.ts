import path from 'node:path';
import shell from 'shelljs';
import { logger } from './logger';

export function cloneGithubRepo(repo: string, destination: string) {
	if (!shell.which('git')) {
		logger.error('Sorry, this script requires "git"');
		shell.exit(1);
	}

	let repoURI = `https://github.com/${repo}`;

	if (repo.startsWith('http') || repo.startsWith('git@')) {
		repoURI = repo;
	}
	logger.info('Cloning to', destination);
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
	logger.info(pth);
	// TODO: pick package manager automaticly (support npm, pnpm, yarn & bun)

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
