#!/usr/bin/env node

import { input, select, confirm } from '@inquirer/prompts';
import { Command } from '@commander-js/extra-typings';
import path from 'node:path';
import { logger } from './lib/logger';
import {
	PackageManager,
	cloneGithubRepo,
	installDeps,
	updatePackageJSON,
} from './lib/utils';
import { version, name, description } from '../package.json';

export const program = new Command()
	.name(name)
	.version(version)
	.description(description)
	.option('-d, --debug', 'Enable debug mode')
	// default command
	.action(GUIcloneCommand);

export const options = program.opts();

if (options.debug) {
	logger.debug('Debug mode enabled');
}

program
	.command('clone')
	// .option('-lr, --latest-release', 'Use latest release')
	.description('Clone the repo to specified path as much as fresh')
	.argument(
		'<repo>',
		'EG: proxitystudios/typescript-starter OR https://github.com/proxitystudios/typescript-starter'
	)
	.argument('<path>', "EG: path/to/clone'")
	.action(NOGUIcloneCommand);

// Parse the command-line arguments
program.parse(process.argv);

function NOGUIcloneCommand(repo: string, destination: string) {
	// options.debug
	const pth = path.resolve(destination);

	try {
		cloneGithubRepo(repo, pth);
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

		let selectedPackageManager;
		if (installDependencies) {
			selectedPackageManager = await select({
				message: 'Select the package manager of the repo',
				choices: [
					{
						name: PackageManager.npm,
						value: PackageManager.npm,
						description: PackageManager.npm,
					},
					{
						name: PackageManager.bun,
						value: PackageManager.bun,
						description: `${PackageManager.bun} (currently not supported)`,
						disabled: true,
					},
					{
						name: PackageManager.pnpm,
						value: PackageManager.pnpm,
						description: `${PackageManager.pnpm} (currently not supported)`,
						disabled: true,
					},
					{
						name: PackageManager.yarn,
						value: PackageManager.yarn,
						description: `${PackageManager.yarn} (currently not supported)`,
						disabled: true,
					},
				],
			});
		}

		const pth = path.resolve(destination);
		cloneGithubRepo(repo, pth);

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
