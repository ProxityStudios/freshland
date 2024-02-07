import { Command } from 'commander';
import { logger } from './utils/logger';
import { version, name, description } from '../package.json';
import GUICloneCommand from './commands/gui-clone.command';

async function main() {
	const app = new Command()
		.name(name)
		.description(description)
		.version(version, '-v, --vers', 'Output the current version')
		.option('--verbose', 'Enable verbose mode')
		.option('--force', 'Enable force mode')
		// default command
		.action(GUICloneCommand);

	await app.parseAsync();
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
}

main().catch((err) =>
	logger.error(
		'An unexpected error occured. Please let us to know. Error:',
		err
	)
);
