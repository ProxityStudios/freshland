import type Freshland from './freshland';
import type templatesData from '../local-data/templates.json';

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

export interface PlatformSource {
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

export interface Template {
  name: string;
  displayName: string;
  uri: `https://${string}` | `http://${string}`;
}
export type TemplateWithoutName = Omit<Template, 'name'>;

export type TemplateKeys = keyof typeof templatesData;

export type TemplateKeysWithS = TemplateKeys | (string & { __brand?: 'TemplateKeysWithS' });
