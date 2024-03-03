import type Freshland from '.';

export interface Dependencies {
	freshland: Freshland;
}
export interface FreshlandOptions {
	verbose: boolean;
	proxy?: string;
}

export type FreshlandMode = 'tar' | 'git';

export type Ref =
	| {
			type: string;
			hash: string;
			name?: undefined;
	  }
	| {
			type: string;
			name: string;
			hash: string;
	  };
export type RefArray = Ref[];

export interface RepositorySource {
	site: string;
	userName: string;
	repoName: string;
	ref: string;
	url: string;
	ssh: string;
	subDirectory?: string;
	mode: string;
}

export type SupportedPlatforms = Record<string, string>;
