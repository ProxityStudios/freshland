#!/usr/bin/env node

import { input, select, confirm } from '@inquirer/prompts';
import { Command } from '@commander-js/extra-typings';
import path from 'node:path';
import { logger } from './lib/logger';
import {
	cloneGithubRepo,
	deleteAndInitGit,
	installDeps,
	initEPAForJS,
	initEPAForTS,
	updatePackageJSON,
} from './lib/utils';
import { version, name, description } from '../package.json';
import { PackageManager } from './types';

export const program = new Command()
	.name(name)
	.version(version)
	.description(description)
	.option('-d, --debug', 'Enable debug mode')
	// default command
	.action(GUIcloneCommand);
program
	.command('clone')
	// TODO: implement this
	// .option('-lr, --latest-release', 'Use latest release')
	.description('Clone the repo to specified path as much as fresh')
	.argument(
		'<repo>',
		'EG: proxitystudios/typescript-starter OR https://github.com/proxitystudios/typescript-starter'
	)
	.argument('<path>', 'EG: path/to/clone')
	.action(NOGUIcloneCommand);

program
	.command('init-epa')
	.description(
		'[BETA] Installs "eslint", "prettier", "airbnb" and configures it automaticlly.'
	)
	.argument('<path>', 'path/to/install')
	.option('--ts, --typescript', 'Use typpescript')
	.action(initEPACommand);

export const globalOptions = program.opts();

if (globalOptions.debug) {
	logger.debug('Debug mode enabled');
}

// Parse the command-line arguments
program.parse(process.argv);

interface InstallEPACommandOptions {
	typescript?: true;
}

async function initEPACommand(pth: string, opts: InstallEPACommandOptions) {
	const { typescript } = opts;

	if (typescript) {
		await initEPAForTS(path.resolve(pth));
	} else {
		initEPAForJS();
	}
}

function NOGUIcloneCommand(repo: string, destination: string) {
	// options.debug
	const pth = path.resolve(destination);

	try {
		cloneGithubRepo(repo, pth);
		deleteAndInitGit(pth);

		// FIXME: it uses default package manager (npm)
		updatePackageJSON(destination.split('/').pop()!, pth);

		logger.warn('You need to install dependencies manually!');
		logger.info('Done, you are ready to code!');
	} catch {
		logger.error('An unexpected error occured or user canceled the process.');
	}
}
async function GUIcloneCommand() {
	// options.debug
	let repo: string;

	try {
		const usingTemplate = await confirm({
			message: 'Do you want to use a starter?',
			default: false,
		});

		repo = await (usingTemplate
			? select({
					message: 'Select a starter',
					choices: [
						{
							name: 'typescript-starter',
							value: 'proxitystudios/typescript-starter',
							description: 'typescript-starter',
						},
						{
							name: 'express-api-starter-ts',
							value: 'proxitystudios/express-api-starter-ts',
							description: 'express-api-starter-ts',
						},
						{
							name: 'discord-bot-starter-ts',
							value: 'proxitystudios/discord-bot-starter-ts',
							description: 'discord-bot-starter-ts',
						},
					],
				})
			: input({
					message: 'What repo do you want to clone?',
					validate: (i) => {
						if (i.trim() === '') {
							return 'Repo cannot be empty.';
						}
						return true;
					},
				}));

		const destination = await input({
			message: 'Where do you want to clone?',
			validate: (i) => {
				if (i.trim() === '') {
					return 'Path cannot be empty.';
				}
				return true;
			},
		});

		const projectName = await input({
			message: 'What should we call this repo?',
			validate: (i) => {
				if (i.trim() === '') {
					return 'Repo name cannot be empty.';
				}
				return true;
			},
		});

		const installDependencies = await confirm({
			message: 'Do you want to install dependencies?',
			default: true,
		});

		/*
		const installEPA = await confirm({
			message:
				'Do you want to install "eslint", "prettier" & "airbnb" and configure automaticlly?',
			default: true,
		});
		*/

		let selectedPackageManager;
		if (installDependencies) {
			selectedPackageManager = await select({
				message: 'Select the package manager of the repo',
				choices: [
					{
						name: PackageManager.NPM,
						value: PackageManager.NPM,
						description: `Install dependencies using ${PackageManager.NPM}`,
					},
					{
						name: PackageManager.BUN,
						value: PackageManager.BUN,
						description: `Install dependencies using ${PackageManager.BUN}`,
					},
					{
						name: PackageManager.PNPM,
						value: PackageManager.PNPM,
						description: `Install dependencies using ${PackageManager.PNPM}`,
					},
					{
						name: PackageManager.YARN,
						value: PackageManager.YARN,
						description: `Install dependencies using ${PackageManager.YARN}`,
					},
				],
			});
		}

		const pth = path.resolve(destination);
		cloneGithubRepo(repo, pth);
		deleteAndInitGit(destination);

		if (selectedPackageManager) {
			installDeps(
				selectedPackageManager,
				projectName.replaceAll(' ', '-'),
				pth
			);
		} else {
			logger.warn('You need to install dependencies manually!');
		}

		logger.info('Done, you are ready to code!');
		// TODO: open vscode when its done
	} catch {
		logger.error('An unexpected error occured or user canceled the process.');
	}
}
