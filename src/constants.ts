import type { SupportedPlatformsType } from './types';

const CompanyGithubProfile = 'https://github.com/ProxityStudios';

// TODO: fetch templates from a github repository
const Templates = {
  TypeScriptStarter: `${CompanyGithubProfile}/typescript-starter`,
  JavaScriptStarter: `${CompanyGithubProfile}/javascript-starter`,

  ExpressApiTS: `${CompanyGithubProfile}/express-api-starter-ts`,
  ExpressApiJS: `${CompanyGithubProfile}/express-api-starter-js`,

  DiscordBotTS: `${CompanyGithubProfile}/discord-bot-starter-ts`,
  DiscordBotJS: `${CompanyGithubProfile}/discord-bot-starter-js`,
};

const SupportedModes = new Set(['tar'] as const); // "git"
const SupportedPlatforms: SupportedPlatformsType = {
  github: 'com', // github.com
  gitlab: 'com', // gitlab.com
  bitbucket: 'org', // bitbucket.org
  'git.sr.ht': '', // git.sr.ht
};

const Constants = {
  SupportedModes,
  SupportedPlatforms,
  Templates,
  CompanyGithubProfile,
};
export default Constants;
