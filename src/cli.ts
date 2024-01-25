#!/usr/bin/env node

import { input, select, confirm } from '@inquirer/prompts';
import { Command } from '@commander-js/extra-typings';
import { logger } from './lib/logger';
import { cloneGithubRepo } from './lib/utils';
import { version, name, description } from '../package.json';

export const program = new Command()
	.name(name)
	.version(version)
	.description(description)
	.option('-d, --debug', 'Enable debug mode')
	// default command
	.action(GUIcloneCommand);

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

const options = program.opts();

function NOGUIcloneCommand(repo: string, path: string) {
	// options.debug
	try {
		cloneGithubRepo(repo, path);
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
							return 'Repo name cannot be empty.';
						}
						return true;
					},
				}));

		const path = await input({
			message: 'Where do you want to clone?',
			validate: (i) => {
				if (i.trim() === '') {
					return 'Path cannot be empty.';
				}
				return true;
			},
		});

		cloneGithubRepo(repo, path);
	} catch {
		logger.error('An unexpected error occured or user canceled the process.');
	}
}
