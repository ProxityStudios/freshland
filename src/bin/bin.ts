import { Command, Option } from '@commander-js/extra-typings';
import { prompt } from 'enquirer';

import { version, name, description } from '../../package.json';
import type { FreshlandMode } from '../types';
import Constants from '../utils/constants';
import FLError from '../exceptions/FLError';
import container from './root';

export function startProgram() {
	const freshland = container.resolve('freshland');

	const program = new Command()
		.name(name)
		.description(description)
		.version(version, '-v, --vers', 'Output the current version')
		.option('--verbose', 'Enable verbose mode')
		.option('--proxy <proxy>', 'Use proxy')
		.option('--force', 'Enable force mode')
		.addOption(
			new Option('--mode <mode>', 'Change the mode').choices<
				readonly FreshlandMode[]
			>(['tar', 'git'] as const)
		)
		.action(async (options) => {
			const { confirmTemplate }: { confirmTemplate: boolean } = await prompt(
				{
					type: 'confirm',
					name: 'confirmTemplate',
					message: 'Do you want to use a template?',
				}
			);

			const { source }: { source: string } = await (confirmTemplate
				? prompt({
						type: 'select',
						name: 'source',
						message: 'Choose a template',
						choices: [
							{
								message: 'Use TypeScript Starter',
								name: Constants.Templates.TypeScriptStarter,
							},
							{
								message: 'Use JavaScript Starter',
								name: Constants.Templates.JavaScriptStarter,
							},
							{
								message: 'Use Express API Starter (menu)',
								name: 'TODO: Implement MENU',
							},
							{
								message: 'Use Discord Bot Starter (menu)',
								name: 'TODO: Implement MENU',
							},
						],
					})
				: prompt({
						type: 'input',
						name: 'source',
						message: 'What source do you want to clone?',
						validate: (sourceRepo) => {
							if (sourceRepo.trim() === '') {
								return 'Cannot be empty';
							}

							return true;
						},
					}));

			const { destination }: { destination: string } = await prompt({
				type: 'input',
				name: 'destination',
				message: 'Where do you want to clone?',
				validate: (i) => {
					if (i.trim() === '') {
						return 'Cannot be empty';
					}
					return true;
				},
			});

			if (!options.force) {
				const { force }: { force: boolean } = await prompt({
					type: 'confirm',
					name: 'force',
					message:
						"Should we clone the target if it's not empty? (force mode)",
					initial: false,
				});

				freshland.setForceMode(force);
			}

			if (confirmTemplate) {
				freshland.useTemplate(source);
			} else {
				freshland.getOrSetSource(source);
			}

			freshland.getOrSetDestination(destination);

			await freshland.startProcess();
		})
		.parse();

	const globalOpts = program.opts();

	try {
		if (globalOpts.mode) {
			freshland.setMode(globalOpts.mode);
		}

		if (globalOpts.proxy) {
			freshland.setProxy(globalOpts.proxy);
		}

		if (globalOpts.verbose) {
			freshland.setVerboseMode(globalOpts.verbose);
		}

		if (globalOpts.force) {
			freshland.setForceMode(globalOpts.force);
		}
		/*
	app.command('clone')
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
		.action(NOGUICloneCommand);
*/
	} catch (err) {
		throw new FLError(
			'An unexpected error occured. Please let us to know.',
			'BIN_TOP_LEVEL_ERROR',
			err
		);
	}
}
