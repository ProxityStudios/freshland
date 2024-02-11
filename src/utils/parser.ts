export interface RepositoryInfo {
	site: string;
	userName: string;
	repoName: string;
	ref: string;
	url: string;
	ssh: string;
	subDirectory?: string;
	mode: string;
}

type SupportedPlatform = Record<string, string>;

class Parser {
	static supportedPlatforms: SupportedPlatform = {
		github: 'com',
		gitlab: 'com',
		bitbucket: 'org',
		'git.sr.ht': '',
	};

	static parseSource(src: string): RepositoryInfo {
		const match =
			/^(?:(?:https?:\/\/)?([^:/]+\.[^:/]+)\/|git@([^:/]+)[:/]|([^/]+):)?([^/\s]+)\/([^/\s#]+)(?:((?:\/[^/\s#]+)+))?(?:\/)?(?:#(.+))?/.exec(
				src
			);

		if (!match) {
			throw new Error(`Unable to parse ${src}`);
		}

		const site = (match[1] || match[2] || match[3] || 'github').replace(
			/\.(com|org)$/,
			''
		);

		if (!this.supportedPlatforms.hasOwnProperty(site)) {
			throw new Error('Platform not supported');
		}

		const userName = match[4];
		const repoName = match[5].replace(/\.git$/, '');
		const subDirectory = match[6];
		const ref = match[7] || 'HEAD';

		const domain = `${site}.${this.supportedPlatforms[site]}`;
		const url = `https://${domain}/${userName}/${repoName}`;
		const ssh = `git@${domain}:${userName}/${repoName}`;

		const mode = this.supportedPlatforms.hasOwnProperty(site) ? 'tar' : 'git';

		return { site, userName, repoName, ref, url, ssh, subDirectory, mode };
	}
}
export default Parser;
