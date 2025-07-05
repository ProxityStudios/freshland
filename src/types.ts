import type Freshland from './freshland';

export interface Dependencies {
  freshland: Freshland;
}
export interface FreshlandOptions {
  verbose: boolean;
  proxy?: string; // TODO: use as global proxy
}

export type FreshlandMode = 'tar'; //| 'git';

export type Ref = {
  type: string;
  name?: string;
  hash: string;
};

export type RefArray = Ref[];

export interface RepositorySource {
  domain: 'https://${string}' | 'http://${string}' | string;
  site: string;
  userName: string;
  repoName: string;
  ref: string;
  url: string;
  urlWithoutRepoAndUsername: string;
  ssh: string;
  subDirectory?: string;
  mode: string;
}

export type SupportedPlatformsType = Record<string, string>;
