import Constants from '../../constants';
import type { PlatformSource } from '../../types';

export class Parser {
  // FIXME: when users use git.sr.ht, the url going to be git.sr.ht.
  static parseSource(repo: string): PlatformSource {
    if (repo.length > 1000) {
      throw new Error('[TOO_LONG_INPUT] Input too long');
    }

    const match =
      /^(?:(?:https?:\/\/)?([^:/\s]+)(?::\d+)?\/|git@([^:/\s]+)[:\/]|([^@:/\s]+)@)?([^/\s]+)\/([^/\s#]+)(?:((?:\/[^/\s#]+)+))?(?:\/)?(?:#(.+))?/.exec(
        repo
      );

    if (!match) {
      throw new Error(`[PLATFORM_NOT_SUPPORTED] Unable to parse source "${repo}"`);
    }

    const site = (match[1] || match[2] || match[3] || 'github').replace(/\.(com|org)$/, '');

    if (!Constants.SupportedPlatforms.hasOwnProperty(site)) {
      throw new Error('[PLATFORM_NOT_SUPPORTED] Platform not supported');
    }

    const userName = match[4];
    const repoName = match[5].replace(/\.git$/, '');
    const subDirectory = match[6];
    const ref = match[7] || 'HEAD';

    const domain = `${site}.${Constants.SupportedPlatforms[site]}`;
    const url = `https://${domain}/${userName}/${repoName}`;
    const urlWithoutRepoAndUsername = `https://${domain}`;
    const ssh = `git@${domain}:${userName}/${repoName}`;

    const mode = Constants.SupportedPlatforms.hasOwnProperty(site) ? 'tar' : 'git';

    return { site, userName, repoName, ref, url, urlWithoutRepoAndUsername, ssh, subDirectory, mode };
  }
}
