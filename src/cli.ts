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
import { InitEPACommandOptions, PackageManager } from './types';

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

async function initEPACommand(pth: string, opts: InitEPACommandOptions) {
	const { typescript } = opts;
	const p = path.resolve(pth);
	await (typescript ? initEPAForTS(p) : initEPAForJS(p));
}

function NOGUIcloneCommand(repo: string, destination: string) {
	// options.debug
	const pth = path.resolve(destination);

	try {
		cloneGithubRepo(repo, pth);
		deleteAndInitGit(pth);

		// FIXME: it uses default package manager (npm)
		updatePackageJSON(destination.split('/').pop()!, '1.0.0', pth);

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
							description: 'Use TypeScript Starter that includes E.P.A',
						},
						{
							name: 'express-api-starter-ts',
							value: 'proxitystudios/express-api-starter-ts',
							description:
								'Use Express API Starter written with TypeScript that includes E.P.A',
						},
						{
							name: 'discord-bot-starter-ts',
							value: 'proxitystudios/discord-bot-starter-ts',
							description:
								'Use Discord Bot Starter written with TypeScript that includes E.P.A',
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

		const pth = path.resolve(destination);

		const updatePackageNameAndVersion = await confirm({
			message: 'Do you want to change the package name and version?',
			default: false,
		});

		let packageName: string;
		let packageVersion: string;
		if (updatePackageNameAndVersion) {
			packageName = await input({
				message: 'What should we call this repo?',
				default:
					destination === '.'
						? pth.split(/[/\\]/).pop()!
						: destination.replaceAll(' ', '-').split(/[/\\]/).pop()!,
				transformer: (v) => {
					return v.replaceAll(' ', '-');
				},
			});
			packageVersion = await input({
				message: 'What version should we use?',
				default: '1.0.0',
				validate: (i) => {
					if (!/^[\d.]*$/.test(i)) {
						return 'Version should include only numbers and dots. (1.0.0)';
					}

					if (i.split('.').length < 2) {
						return 'Version should include at least a dot. (1.0)';
					}

					return true;
				},
			});
		}
		const installDependencies = await confirm({
			message: 'Do you want to install dependencies?',
			default: true,
		});

		/*
		const initEPA = await confirm({
			message:
				'Do you want to init E.P.A and automaticlly configure it?',
			default: false,
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

		cloneGithubRepo(repo, pth);
		deleteAndInitGit(destination);

		if (updatePackageNameAndVersion) {
			updatePackageJSON(packageName!, packageVersion!, pth);
		}

		if (selectedPackageManager) {
			installDeps(selectedPackageManager, pth);
		} else {
			logger.warn('You need to install dependencies manually!');
		}

		logger.info('Done, you are ready to code!');
		// TODO: open vscode when its done
	} catch {
		logger.error('An unexpected error occured or user canceled the process.');
	}
}
