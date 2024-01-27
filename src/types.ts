export enum Check {
	FILE,
	VIDEO,
	IMAGE,
	DIRECTORY,
}

export enum PackageManager {
	npm = 'npm',
	pnpm = 'pnpm',
	yarn = 'yarn',
	bun = 'bun',
}
export type PackageManagerKeys = keyof typeof PackageManager;
