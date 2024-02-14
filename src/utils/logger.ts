import { Logger } from 'tslog';

export const logger = new Logger({
	type: 'pretty',
	name: 'Freshland',
	prettyLogTemplate: '{{MM}}:{{ss}} {{logLevelName}} ',
});
