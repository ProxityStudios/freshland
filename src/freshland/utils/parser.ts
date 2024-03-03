import Constants from '../../constants';
import FLError from '../../exceptions/FLError';
import type { RepositorySource } from '../types';

class Parser {
	static parseSource(src: string): RepositorySource {
		const match =
			/^(?:(?:https?:\/\/)?([^:/]+\.[^:/]+)\/|git@([^:/]+)[:/]|([^/]+):)?([^/\s]+)\/([^/\s#]+)(?:((?:\/[^/\s#]+)+))?(?:\/)?(?:#(.+))?/.exec(
				src
			);

		if (!match) {
			throw new FLError(`Unable to parse ${src}`, 'INVALID_SOURCE');
		}

		const site = (match[1] || match[2] || match[3] || 'github').replace(
			/\.(com|org)$/,
			''
		);

		if (!Constants.SupportedPlatforms.hasOwnProperty(site)) {
			throw new FLError('Platform not supported', 'INVALID_PLATFORM');
		}

		const userName = match[4];
		const repoName = match[5].replace(/\.git$/, '');
		const subDirectory = match[6];
		const ref = match[7] || 'HEAD';

		const domain = `${site}.${Constants.SupportedPlatforms[site]}`;
		const url = `https://${domain}/${userName}/${repoName}`;
		const ssh = `git@${domain}:${userName}/${repoName}`;

		const mode = Constants.SupportedPlatforms.hasOwnProperty(site)
			? 'tar'
			: 'git';

		return { site, userName, repoName, ref, url, ssh, subDirectory, mode };
	}
}
export default Parser;
