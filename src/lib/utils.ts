import axios from 'axios';
import path from 'node:path';
import shell from 'shelljs';
import { mainLogger } from './logger';

export async function cloneGithubRepo(repo: string, destination: string) {
	if (!shell.which('git')) {
		mainLogger.error('Sorry, this script requires "git"');
		shell.exit(1);
	}

	const repoURI = `https://github.com/${repo}`;
	const pathToClone = path.resolve(destination);

	try {
		await axios.get(`https://api.github.com/repos/${repo}`);
	} catch {
		mainLogger.error(
			'Repo is not available or an unexpected error has occurred. Please try again...'
		);
		shell.exit(1);
	}

	mainLogger.error('Cloning to', pathToClone);
	if (shell.exec(`git clone ${repoURI} ${pathToClone}`).code !== 0) {
		mainLogger.error('Cannot clone the repo');
		shell.exit(1);
	}
	mainLogger.info('Repo cloned');

	deleteAndInitGit(pathToClone);
	updatePackageJSON(destination.replaceAll('/', '-'), pathToClone);

	// TODO: install deps automaticly (support npm, pnpm & yarn)
	// TODO: open vscode when its done
	mainLogger.warn('IMPORTANT - You need to install dependencies - IMPORTANT');

	mainLogger.info('Done, you are ready to go!');
}

export function deleteAndInitGit(pth: string) {
	shell.cd(pth);

	if (shell.rm('-rf', '.git/').code !== 0) {
		mainLogger.error('Cannot delete ".git" folder');
		shell.exit(1);
	}

	mainLogger.info('Initializing git');
	if (shell.exec('git init').code !== 0) {
		mainLogger.error('"git init" command failed');
		shell.exit(1);
	}
	if (shell.exec('git add .').code !== 0) {
		mainLogger.error('"git add" command failed');
		shell.exit(1);
	}

	if (shell.exec(`git commit -am "Auto-commit by Freshland"`).code !== 0) {
		mainLogger.error('"git commit" command failed');
		shell.exit(1);
	}
}

export function updatePackageJSON(projectName: string, pth: string) {
	shell.cd(pth);

	if (shell.test('-e', './package.json')) {
		mainLogger.info('Updating "package.json"');
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
		mainLogger.info('Updating "package-lock.json"');
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
