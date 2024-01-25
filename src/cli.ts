#!/usr/bin/env node

import { input } from '@inquirer/prompts';
import { Command } from '@commander-js/extra-typings';
import { logger } from './lib/logger';
import { cloneGithubRepo } from './lib/utils';
import { version, name, description } from '../package.json';

export const program = new Command()
	.name(name)
	.version(version)
	.description(description)
	.option('-d, --debug', 'Enable debug mode')
	// default
	.action(GUIcloneCommand);

program
	.command('clone')
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

async function NOGUIcloneCommand(repo: string, path: string) {
	// options.debug
	try {
		await cloneGithubRepo(repo, path);
	} catch {
		logger.error('An unexpected error occured');
	}
}

async function GUIcloneCommand() {
	// options.debug

	try {
		const repo = await input({
			message: 'What repo do you want to clone?',
			validate: (i) => {
				if (i.trim() === '') {
					return 'Repo name cannot be empty.';
				}
				return true;
			},
		});
		const path = await input({
			message: 'Where do you want to clone?',
			validate: (i) => {
				if (i.trim() === '') {
					return 'Path cannot be empty.';
				}
				return true;
			},
		});

		await cloneGithubRepo(repo, path);
	} catch {
		logger.error('An unexpected error occured');
	}
}
