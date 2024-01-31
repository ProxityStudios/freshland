export enum Check {
	FILE,
	VIDEO,
	IMAGE,
	DIRECTORY,
}

export enum PackageManagerEnum {
	npm = 'npm',
	pnpm = 'pnpm',
	yarn = 'yarn',
	bun = 'bun',
}

export type PackageManager =
	| keyof typeof PackageManagerEnum
	| PackageManagerEnum;

export interface InitEPACommandOptions {
	typescript?: true;
}

export interface NOGUIcloneCommandOptions {
	keepGit?: true;
	name?: string;
	version?: string;
	installDeps?: string;
	updatePackage?: true;
}
