import { confirm, input, select } from '@inquirer/prompts';
import Constants from '../constants';
import container from '../container';
import { logger } from '../utils/logger';

const freshland = container.resolve('freshland');

const GUICloneCommand = async () => {
	const confirmStarter = await confirm({
		message: 'Do you want to use a template?',
		default: false,
	});

	// TODO: fetch templates urls from ProxityStudios/urls
	const source = await (confirmStarter
		? select({
				message: 'Choose a template',
				choices: [
					{
						name: 'Use TypeScript Starter',
						value: Constants.Templates.TypeScriptStarter,
					},
					{
						name: 'Use JavaScript Starter',
						value: Constants.Templates.JavaScriptStarter,
					},
					{
						name: 'Use Express API Starter (menu)',
						value: 'TODO: Implement MENU',
					},
					{
						name: 'Use Discord Bot Starter (menu)',
						value: 'TODO: Implement MENU',
					},
				],
			})
		: input({
				message: 'What source do you want to clone?',
				validate: (sourceRepo) => {
					if (sourceRepo.trim() === '') {
						return 'Cannot be empty';
					}

					return true;
				},
			}));

	const destination = await input({
		message: 'Where do you want to clone?',
		validate: (i) => {
			if (i.trim() === '') {
				return 'Cannot be empty';
			}
			return true;
		},
	});

	const confirmForce = await confirm({
		message:
			"Should we clone if the destination folder isn't empty? (force mode)",
		default: false,
	});

	freshland.verbose('Source:', source);
	freshland.verbose('Destination:', destination);

	freshland.verbose('Force mode:', confirmForce);
	freshland.setForceMode(confirmForce);

	if (confirmStarter) {
		freshland.verbose('Using template:', source);
		freshland.useTemplate(source);
	} else {
		freshland.getOrSetSource(source);
	}

	freshland.getOrSetDestination(destination);

	logger.info('Cloning process started');
	await freshland.start();
	logger.info('Done, you are ready to code!');
};

export default GUICloneCommand;
