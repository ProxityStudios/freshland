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
	FAIL = 1,
}

const Constants = {
	Templates,
	ProcessStatus,
	CompanyGithubProfile,
};
export default Constants;
