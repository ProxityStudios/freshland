import shellExec from 'shell-exec';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { Utils } from './utils';
import { Parser } from './parser';
import { Emitter } from './emitter';
import type { FreshBuilder, FreshBuilderData } from '../structures/FreshBuilder';
import type { FreshlandOptions, Ref, RefArray, RepositorySource } from '../types';
import { logger } from '../logger';

export class Freshland {
  public readonly emitter: Emitter;

  public verboseMode: boolean;

  constructor(public readonly options: FreshlandOptions = { verbose: false }) {
    this.emitter = new Emitter();
    this.verboseMode = options.verbose;
  }

  public async clone(builder: FreshBuilder | FreshBuilderData): Promise<void> {
    try {
      const builderData = Utils.getBuilderData(builder);
      const isEmptyDir = await Utils.checkDirIsEmpty(builderData.destination);

      if (!isEmptyDir && !builderData.force) {
        throw new Error(
          'Destination directory is not empty, aborting. (you can use "<Builder>.setForce(true)" or provide "--force" flag to bypass)'
        );
      } else {
        logger.warn('Destination directory is not empty. Skipping (force mode)');
      }

      switch (builderData.mode) {
        case 'tar':
          this.verbose('Choosen Mode:', builderData.mode);
          await this.cloneUsingTar(builderData);
          break;
        case 'git':
          this.verbose('Choosen Mode:', builderData.mode);
          await this.cloneUsingGit(builderData);
          break;
        default:
          throw new Error(`Mode "${builderData.mode}" not supported yet`);
      }

      this.emitter.emit('successClone', builderData);
    } catch (error) {
      throw error;
    }
  }

  private async cloneUsingTar(builderData: FreshBuilderData) {
    const parsedSrc = Parser.parseRepository(builderData.source);
    const hash = await this.getCommitHash(parsedSrc);
    const subDirectory = parsedSrc.subDirectory ? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}` : undefined;

    if (!hash) throw new Error(`Could not find the commit hash for ${parsedSrc.ref}`);

    let url: string;
    if (parsedSrc.site === 'gitlab') {
      url = `${parsedSrc.url}/repository/archive.tar.gz?ref=${hash}`;
    } else if (parsedSrc.site === 'bitbucket') {
      url = `${parsedSrc.url}/get/${hash}.tar.gz`;
    } else {
      url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
    }

    const fileName = `${hash}.tar.gz`;
    const destWithFileName = `${builderData.destination}/${fileName}`;

    await Utils.makeParentDir(builderData.destination);

    this.verbose(`Downloading from "${url}`);
    await Utils.downloadFile(url, destWithFileName, builderData.proxy);

    this.verbose(`Extracting from "${destWithFileName}`);
    await Utils.extractTar(destWithFileName, builderData.destination, subDirectory);

    await fs.promises.rm(destWithFileName, {
      force: true,
      recursive: true,
    });
  }

  private async cloneUsingGit(builderData: FreshBuilderData) {
    this.verbose('Cloning...');
    await shellExec(`git clone --depth 1 ${builderData.source.toString()} ${builderData.destination.toString()}`);

    this.verbose('Deleting ".git" folder');
    await fs.promises.rm(path.resolve(builderData.destination, '.git'), {
      force: true,
      recursive: true,
    });
  }

  private async getCommitHash(source: RepositorySource): Promise<string | null> {
    const refs = await this.fetchRefs(source);

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

  private async fetchRefs(source: RepositorySource): Promise<RefArray> {
    const { stdout } = await shellExec(`git ls-remote ${source.url}`);
    if (!stdout) throw new Error(`[NO_ACCESS] Could not fetch "${source.url}"`);

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
    if (this.verboseMode) logger.debug(...args);
  }

  public setVerboseMode(verbose: boolean) {
    this.verboseMode = verbose;
  }
}

export default Freshland;
