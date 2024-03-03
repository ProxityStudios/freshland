import type { SupportedPlatforms } from './freshland/types';

const CompanyGithubProfile = 'https://github.com/ProxityStudios';

// TODO: fetch templates urls from ProxityStudios/urls
const Templates = {
	TypeScriptStarter: `${CompanyGithubProfile}/typescript-starter`,
	JavaScriptStarter: `${CompanyGithubProfile}/javascript-starter`,

	ExpressApiTS: `${CompanyGithubProfile}/express-api-starter-ts`,
	ExpressApiJS: `${CompanyGithubProfile}/express-api-starter-js`,

	DiscordBotTS: `${CompanyGithubProfile}/discord-bot-starter-ts`,
	DiscordBotJS: `${CompanyGithubProfile}/discord-bot-starter-js`,
};

enum ProcessStatus {
	OK = 0,
	ERROR = 1,
}

const SupportedModes = new Set(['tar', 'git'] as const);
// eslint-disable-next-line @typescript-eslint/no-redeclare
const SupportedPlatforms: SupportedPlatforms = {
	github: 'com',
	gitlab: 'com',
	bitbucket: 'org',
	'git.sr.ht': '',
};

const Constants = {
	SupportedModes,
	SupportedPlatforms,
	Templates,
	ProcessStatus,
	CompanyGithubProfile,
};
export default Constants;
