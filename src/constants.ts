import type { SupportedPlatformsType } from './types';

const TemplatesRepositoryURI = 'https://github.com/ProxityStudios/freshland-templates';

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
  TemplatesRepositoryURI,
};
export default Constants;
