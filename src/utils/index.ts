import Constants from './constants';

export function getTemplateIfExists(templateSource: string): string {
	const found = Object.entries(Constants.Templates).find(
		([_, val]) => val === templateSource
	);

	if (!found) {
		throw new Error('Invalid template');
	}

	return found[1];
}
