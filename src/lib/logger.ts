import { Logger } from 'tslog';

export const logger = new Logger({
	type: 'pretty',
	prettyLogTemplate: '{{MM}}:{{ss}} {{logLevelName}} ',
});
