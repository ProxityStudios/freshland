import type { SupportedPlatformsType } from './types';

export const TemplatesRepositoryURI = 'https://github.com/ProxityStudios/repick-templates';

export const SupportedModes = new Set(['tar'] as const); // "git"
export const SupportedPlatforms: SupportedPlatformsType = {
  github: 'com', // github.com
  gitlab: 'com', // gitlab.com
  bitbucket: 'org', // bitbucket.org
  'git.sr.ht': '', // git.sr.ht
};