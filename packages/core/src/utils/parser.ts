import { RepickError, type PlatformSource, SupportedPlatforms } from '@repick/common';

export class Parser {
  // FIXME: when users use git.sr.ht, the url going to be git.sr.ht.
  static parseSourceOrThrow(repo: string): PlatformSource {
    if (repo.length > 1000) {
      throw new RepickError('Input too long', 'INPUT_TOO_LONG');
    }

    const match =
      /^(?:(?:https?:\/\/)?([^:/\s]+)(?::\d+)?\/|git@([^:/\s]+)[:\/]|([^@:/\s]+)@)?([^/\s]+)\/([^/\s#]+)(?:((?:\/[^/\s#]+)+))?(?:\/)?(?:#(.+))?/.exec(
        repo
      );

    if (!match) {
      throw new RepickError(`Unable to parse source "${repo}"`, 'PARSE_ERROR');
    }

    const site = (match[1] || match[2] || match[3] || 'github').replace(/\.(com|org)$/, '');

    if (!SupportedPlatforms.hasOwnProperty(site)) {
      throw new RepickError('Platform not supported', 'PLATFORM_NOT_SUPPORTED');
    }

    const userName = match[4]!;
    const repoName = match[5]!.replace(/\.git$/, '');
    const subDirectory = match[6];
    const ref = match[7] || 'HEAD';

    const domain = `${site}.${SupportedPlatforms[site]}`;
    const url = `https://${domain}/${userName}/${repoName}`;
    const urlWithoutRepoAndUsername = `https://${domain}`;
    const ssh = `git@${domain}:${userName}/${repoName}`;

    const mode = SupportedPlatforms.hasOwnProperty(site) ? 'tar' : 'git';

    return { site, userName, repoName, ref, url, urlWithoutRepoAndUsername, ssh, subDirectory, mode };
  }

  // TODO:
  // parseTemplate() {}
}
