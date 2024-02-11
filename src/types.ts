export interface FreshlandOptions {
	verbose: boolean;
	proxy?: string;
}

export type FreshlandMode = 'tar' | 'git';

export type Refs = (
	| {
			type: string;
			hash: string;
			name?: undefined;
	  }
	| {
			type: string;
			name: string;
			hash: string;
	  }
)[];

export enum ProcessStatus {
	OK = 0,
	FAIL = 1,
}
