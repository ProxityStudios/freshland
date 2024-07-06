import shellExec from 'shell-exec';
import * as path from 'node:path';
import { EventEmitter } from 'events';
import * as fs from 'node:fs';
import { FreshlandMode, FreshlandOptions, Ref, RefArray, RepositorySource } from './types';
import Utils from './utils';
import { logger } from '../root/logger';
import { Builder, BuilderData } from './builder';
import { Parser } from './utils/parser';

export class Freshland {
  public emitter: EventEmitter;
  protected mode: FreshlandMode;

  constructor(private opts: FreshlandOptions = { verbose: false }) {
    this.emitter = new EventEmitter();
    this.mode = 'tar';
  }

  public async clone(_builder: Builder | BuilderData): Promise<void> {
    try {
      const builderData = _builder instanceof Builder ? _builder.toJSON() : _builder;

      const isEmptyDir = await Utils.checkDirIsEmpty(builderData.destination);

      if (!isEmptyDir && !builderData.force) {
        throw new Error(
          'Destination directory is not empty, aborting. Use <Builder>.setForce(true) or provide "--force" flag to bypass this'
        );
      } else {
        logger.warn('Destination directory is not empty. skipping (force mode enabled)');
      }

      logger.info('BEEP! Im going to handle all you need');
      switch (builderData.mode) {
        case 'tar':
          this.verbose('Choosen Mode:', this.mode);
          await this.cloneUsingTar(builderData);
          break;
        case 'git':
          this.verbose('Choosen Mode:', this.mode);
          await this.cloneUsingGit(builderData);
          break;
        default:
          // unneccesary but ok
          throw new Error(`Mode "${this.mode}" not supported yet`);
      }

      logger.info('Done! you are ready to gift me a coffe');
      this.emitter.emit('done');
    } catch (error) {
      logger.error(error);
    }
  }

  private async cloneUsingTar(builderData: BuilderData) {
    const parsedSrc = Parser.parseSource(builderData.source);
    const hash = await this.getCommitHash(parsedSrc);
    const subDirectory = parsedSrc.subDirectory ? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}` : undefined;

    if (!hash) throw new Error(`Couldn't find commit hash for ${parsedSrc.ref}`);

    let url: string;
    if (parsedSrc.site === 'gitlab') {
      url = `${parsedSrc.url}/repository/archive.tar.gz?ref=${hash}`;
    } else if (parsedSrc.site === 'bitbucket') {
      url = `${parsedSrc.url}/get/${hash}.tar.gz`;
    } else {
      url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
    }

    const fileName = `${hash}.tar.gz`;
    const destPathWithFile = `${builderData.destination}/${fileName}`;

    Utils.makeParentDir(builderData.destination);

    this.verbose(`Downloading from "${url}`);
    await Utils.downloadFile(url, destPathWithFile, this.opts.proxy);

    this.verbose(`Extracting from "${destPathWithFile}`);
    await Utils.extractTar(destPathWithFile, builderData.destination, subDirectory);

    await fs.promises.rm(destPathWithFile, {
      force: true,
      recursive: true,
    });
  }

  private async cloneUsingGit(builderData: BuilderData) {
    this.verbose('Cloning...');
    await shellExec(`git clone --depth 1 ${builderData.source} ${builderData.destination}`);
    this.verbose('Delete .git folder');
    await fs.promises.rm(path.resolve(builderData.destination, '.git'), {
      force: true,
      recursive: true,
    });
  }

  // public useTemplate(template: string) {
  //   this.source = Utils.getTemplateIfExists(template);
  //   this.isUsingTemplate = true;
  // }

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

        if (!ref) {
          return null;
        }

        if (ref === 'HEAD') {
          return {
            type: 'HEAD',
            hash,
          };
        }

        const [, type, name] = /refs\/(\w+)\/(.+)/.exec(ref) ?? [];
        if (!type || !name) {
          return null;
        }

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
    if (this.opts.verbose) logger.debug(...args);
  }

  // public setForceMode(force: boolean) {
  //   this.forceMode = force;
  // }

  // public setVerboseMode(verbose: boolean) {
  //   this.opts.verbose = verbose;
  // }

  // public setProxy(proxy: string) {
  //   this.opts.proxy = proxy;
  // }

  // public setMode(mode: FreshlandMode) {
  //   if (Constants.SupportedModes.has(mode)) {
  //     this.mode = mode;
  //   } else {
  //     throw new Error('Invalid mode. Possible modes: tar, git');
  //   }
  // }

  public get options(): Readonly<FreshlandOptions> {
    return this.opts;
  }
}

export default Freshland;
