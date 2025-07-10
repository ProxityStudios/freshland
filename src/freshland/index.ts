import shellExec from 'shell-exec';
import * as fs from 'node:fs';
import { FreshlandParser } from './utils/parser';
import { FreshlandEmitter } from './emitter';
import { checkDirIsEmptyOrThrow, downloadFile, extractTar, getBuilderData, makeParentDirOrThrow } from './utils';
import type { FreshlandBuilder, FreshBuilderData } from '../structures/FreshlandBuilder';
import type { FreshlandOptions, Ref, RefArray, PlatformSource } from '../types';
import { FreshlandError } from '../structures/FreshlandError';

// TODO: handle errors gracefully & implement own error system
export class Freshland {
  public readonly events: FreshlandEmitter;

  public verboseMode: boolean;

  constructor(public readonly options: FreshlandOptions = { verbose: false }) {
    this.events = new FreshlandEmitter();
    this.verboseMode = true; // options.verbose;
  }

  public async clone(builder: FreshlandBuilder | FreshBuilderData): Promise<true | Error> {
    try {
      const builderData = getBuilderData(builder);

      const isEmptyDir = await checkDirIsEmptyOrThrow(builderData.destination);

      if (!isEmptyDir && !builderData.force) {
        throw new FreshlandError(
          'Destination isn\'t empty, aborting the process. (use "<FreshBuilder>.setForce(true)" or provide "--force" flag to bypass)',
          'DESTINATION_NOT_EMPTY'
        );
      }
      // else {
      //   logger.warn("Destination directory isn't empty. Skipping (force mode)");
      // }

      switch (builderData.mode) {
        case 'tar':
          this.verbose('Choosen Mode:', builderData.mode);
          await this.cloneUsingTar(builderData);
          break;
        default:
          throw new FreshlandError(`Mode "${builderData.mode}" not supported yet`, 'INVALID_MODE');
      }

      this.events.emit('successClone', builderData);
      return true;
    } catch (error) {
      this.events.emit('error', error);
      throw error;
    }
  }

  private async cloneUsingTar(builderData: FreshBuilderData) {
    const parsedSrc = FreshlandParser.parseSourceOrThrow(builderData.source);
    let fileName: string = `${parsedSrc.ref}.tar.gz`;
    let subDirectory: string | undefined;
    let url: string;

    // TODO: allow to clone a branch from other platforms E.G: gitlab.com/proxitystudios/freshland#anotherBranch
    if (parsedSrc.site === 'gitlab') {
      url = `${parsedSrc.urlWithoutRepoAndUsername}/api/v4/projects/${parsedSrc.userName}%2F${parsedSrc.repoName}/repository/archive.tar.gz?sha=${parsedSrc.ref}`;
    } else if (parsedSrc.site === 'bitbucket') {
      url = `${parsedSrc.url}/get/${parsedSrc.ref}.tar.gz`;
    } else {
      const hash = await this.getCommitHash(parsedSrc);
      if (!hash) throw new FreshlandError(`Could not find the commit hash for ${parsedSrc.ref}`, 'HASH_NOT_FOUND');

      subDirectory = parsedSrc.subDirectory ? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}` : undefined;

      fileName = `${hash}.tar.gz`;
      url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
    }

    const destinationWithFileName = `${builderData.destination}/${fileName}`;

    this.verbose(`Creating parent directory`);
    await makeParentDirOrThrow(builderData.destination);

    this.verbose(`Downloading from "${url}`);
    await downloadFile(url, destinationWithFileName, builderData.proxy);

    this.verbose(`Extracting from "${destinationWithFileName}`);
    // FIXME: subDirectory only works on Github repos
    await extractTar(destinationWithFileName, builderData.destination, subDirectory);

    this.verbose(`Removing copy of downloaded repository: "${destinationWithFileName}`);
    await fs.promises.rm(destinationWithFileName, {
      force: true,
      recursive: true,
    });
  }

  private async getCommitHash(source: PlatformSource): Promise<string | null> {
    const refs = await this.fetchGithubRefsOrThrow(source);

    if (source.ref === 'HEAD') {
      const hash = refs.find((ref) => ref.type === 'HEAD')?.hash;
      this.verbose('HEAD hash:', hash);
      return hash ?? null;
    }

    return this.findCommitHash(refs, source.ref);
  }

  private findCommitHash(refs: RefArray, selector: string): string | null {
    const matchingRef = refs.find((ref) => ref.name === selector);
    if (matchingRef) {
      this.verbose(`Found matching commit hash: ${matchingRef.hash}`);
      return matchingRef.hash;
    }

    if (selector.length < 8) return null;

    const refWithMatchingStart = refs.find((ref) => ref.hash.startsWith(selector));

    this.verbose('Found ref: ' + refWithMatchingStart);
    return refWithMatchingStart?.hash ?? null;
  }

  private async fetchGithubRefsOrThrow(source: PlatformSource): Promise<RefArray> {
    const { stdout } = await shellExec(`git ls-remote ${source.url}`);
    if (!stdout) throw new FreshlandError(`Could not fetch "${source.url}"`, 'FETCH_ERROR');

    return stdout
      .split('\n')
      .filter(Boolean)
      .map((row) => {
        const [hash, ref] = row.split('\t');

        if (!ref) return null;

        if (ref === 'HEAD') {
          return {
            type: 'HEAD',
            hash,
          };
        }

        const [, type, name] = /refs\/(\w+)\/(.+)/.exec(ref) ?? [];
        if (!type || !name) return null;

        let typeResult: string;

        if (type === 'heads') {
          typeResult = 'branch';
        } else if (type === 'refs') {
          typeResult = 'ref';
        } else {
          typeResult = type;
        }

        return {
          type: typeResult,
          name,
          hash,
        };
      })
      .filter((ref): ref is Ref => ref !== null);
  }

  private verbose(...args: unknown[]): void {
    if (this.verboseMode) console.debug('Debug', ...args);
  }

  public setVerboseMode(verbose: boolean) {
    this.verboseMode = verbose;
  }
}

export default Freshland;
