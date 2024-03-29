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
import {
	InitEPACommandOptions,
	NOGUIcloneCommandOptions,
	PackageManagerEnum,
} from './types';

// TWO DASH === COMMAND FLAG
// ONE DASH === GLOBAL FLAG
export const program = new Command()
	.name(name)
	.version(version, '-v, --vers', 'Output the current version')
	.description(description)
	.option('-d, --debug', 'Enable debug mode')
	// default command
	.action(GUIcloneCommand);

program
	.command('clone')
	// TODO: implement this
	// .option('-lr, --latest-release', 'Use latest release')
	.description('Clone a repository to specified path')
	.argument(
		'<repo>',
		'ProxityStudios/typescript-starter OR https://github.com/proxitystudios/typescript-starter'
	)
	.argument('<path>', 'path/to/clone')
	.option('--upd, --update-package', 'Update the package name and version')
	.option(
		'--n, --name <name>',
		'Specify the package name | --upd flag required'
	)
	.option(
		'--v, --version <version>',
		'Specify the package version | --upd flag required'
	)
	.option(
		'--i, --install-deps <packageManager>',
		'Install dependencies (supports npm, yarn, pnpm & bun)'
	)
	.option('--kg, --keep-git', 'Do not delete ".git" folder')
	.action(NOGUIcloneCommand);

program
	.command('init-epa')
	.description(
		'Installs Eslint, Prettier & Airbnb and automatically configures it.'
	)
	.argument('<path>', 'path/to/install')
	.option('--ts, --typescript', 'Use TypeScript')
	.action(initEPACommand);

export const globalOptions = program.opts();

if (globalOptions.debug) {
	logger.debug('Debug mode enabled (--debug)');
}

// Parse the command-line arguments
program.parse(process.argv);

async function initEPACommand(pth: string, opts: InitEPACommandOptions) {
	const { typescript } = opts;
	const p = path.resolve(pth);
	await (typescript ? initEPAForTS(p) : initEPAForJS(p));
}

function NOGUIcloneCommand(
	repo: string,
	destination: string,
	opts: NOGUIcloneCommandOptions
) {
	// options.debug
	const pth = path.resolve(destination);
	const {
		keepGit,
		name: packageName,
		version: packageVersion,
		installDeps: iDeps,
		updatePackage,
	} = opts;

	try {
		cloneGithubRepo(repo, pth);

		if (keepGit) {
			logger.warn('Git deletion skipped. (omit --kg or --keep-git flag)');
		} else {
			deleteAndInitGit(pth);
		}

		// FIXME: it uses default package manager (npm)
		// TODO: only update provided options
		if (!updatePackage && (packageName ?? packageVersion)) {
			logger.warn(
				'You need to provide --update-package flag to change package name and version'
			);
		} else {
			updatePackageJSON(
				packageName
					? packageName.replaceAll(' ', '-')
					: destination.split('/').pop()!,
				packageVersion ?? '1.0.0',
				pth
			);
		}

		if (iDeps) {
			installDeps(iDeps as PackageManagerEnum, pth);
		} else {
			logger.warn('You need to install dependencies manually!');
		}

		logger.info('Done, you are ready to code!');
	} catch {
		logger.error('An unexpected error occured or user canceled the process.');
	}
}
async function GUIcloneCommand() {
	// options.debug
	let repo: string;

	try {
		const usingStarter = await confirm({
			message: 'Do you want to use a starter?',
			default: false,
		});

		repo = await (usingStarter
			? select({
					message: 'Choose a starter to clone',
					choices: [
						{
							name: 'Use TypeScript Starter',
							value: 'proxitystudios/typescript-starter',
						},
						{
							name: 'Use JavaScript Starter',
							value: 'proxitystudios/javascript-starter',
						},
						{
							name: 'Use Express API Starter Written With TypeScript',
							value: 'proxitystudios/express-api-starter-ts',
						},
						{
							name: 'Use Discord Bot Starter Written With TypeScript',
							value: 'proxitystudios/discord-bot-starter-ts',
						},
					],
				})
			: input({
					message: 'What repository do you want to clone?',
					validate: (sourceRepo) => {
						if (sourceRepo.trim() === '') {
							return 'Repository cannot be empty.';
						}
						/*
						if (
							sourceRepo
								.toLocaleLowerCase()
								.includes('proxitystudios/typescript-starter') ||
							sourceRepo
								.toLocaleLowerCase()
								.includes('proxitystudios/express-api-starter-ts') ||
							sourceRepo
								.toLocaleLowerCase()
								.includes('proxitystudios/discord-bot-starter-ts')
						) {
							return 'Repo is in starter section';
						}
						*/

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
				message: 'What should we call this repository?',
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
			default: false,
		});

		let initEPA;
		if (!usingStarter) {
			initEPA = await confirm({
				message:
					'Do you want to init E.P.A and automatically configure it?',
				default: false,
			});
		}

		let repoCodeLanguage: 'javascript' | 'typescript' | undefined;
		if (initEPA) {
			repoCodeLanguage = await select({
				message: 'Select the code language of the repository',
				choices: [
					{
						name: 'This repository uses JavaScript',
						value: 'javascript',
					},
					{
						name: 'This repository uses TypeScript',
						value: 'javascript',
					},
				],
			});
		}

		let selectedPackageManager;
		if (installDependencies) {
			selectedPackageManager = await select({
				message: 'Select the package manager of the repository',
				choices: [
					{
						name: 'This repository uses "npm" as package manager',
						value: PackageManagerEnum.npm,
					},
					{
						name: 'This repository uses "bun" as package manager',
						value: PackageManagerEnum.bun,
					},
					{
						name: 'This repository uses "pnpm" as package manager',
						value: PackageManagerEnum.pnpm,
					},
					{
						name: 'This repository uses "yarn" as package manager',
						value: PackageManagerEnum.yarn,
					},
				],
			});
		}

		cloneGithubRepo(repo, pth);
		deleteAndInitGit(destination);

		if (updatePackageNameAndVersion) {
			updatePackageJSON(packageName!, packageVersion!, pth);
		}

		if (initEPA && repoCodeLanguage) {
			if (repoCodeLanguage === 'javascript') {
				await initEPAForJS(pth);
			}
			if (repoCodeLanguage === 'typescript') {
				await initEPAForTS(pth);
			}
		} else if (selectedPackageManager) {
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
