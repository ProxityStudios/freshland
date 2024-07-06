import * as tar from 'tar';
import shellExec from 'shell-exec';
import * as path from 'node:path';
import { EventEmitter } from 'events';
import * as fs from 'node:fs';
import { FreshlandMode, FreshlandOptions, Ref, RefArray, RepositorySource } from './types';
import Parser from './utils/parser';
import Utils from './utils';
import { logger } from '../root/logger';
import Constants from '../constants';

export class Freshland extends EventEmitter {
  protected forceMode;

  protected src?: string;

  protected destination?: string;

  protected isUsingTemplate;

  protected mode: FreshlandMode;

  constructor(private opts: FreshlandOptions = { verbose: false }) {
    super();

    this.forceMode = false;
    this.isUsingTemplate = false;
    this.mode = 'tar';
  }

  async startProcess(source?: string, destination?: string): Promise<void> {
    try {
      const src = this.getOrSetSource(source);
      const dest = this.getOrSetDestination(destination);

      Utils.checkDirIsEmpty(dest, this.forceMode);

      logger.info('Doing some fresh things...');
      switch (this.mode) {
        case 'tar':
          this.verbose('Choosen Mode:', this.mode);
          await this.cloneWithTar(src, dest);
          break;
        case 'git':
          this.verbose('Choosen Mode:', this.mode);
          await this.cloneWithGit(src, dest);
          break;
        default:
          // unneccesary but ok
          throw new Error(`Mode "${this.mode}" not supported yet`);
      }

      logger.info('Done, you are ready to code!');
      this.emit('done');
    } catch (error) {
      logger.error(error);
    }
  }

  private async cloneWithTar(src: string, destination: string) {
    const parsedSrc = Parser.parseSource(src);
    const hash = await this.getCommitHash(parsedSrc);
    const subDirectory = parsedSrc.subDirectory ? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}` : undefined;

    if (!hash) {
      throw new Error(`Couldn't find commit hash for ${parsedSrc.ref}`);
    }

    let url: string;
    if (parsedSrc.site === 'gitlab') {
      url = `${parsedSrc.url}/repository/archive.tar.gz?ref=${hash}`;
    } else if (parsedSrc.site === 'bitbucket') {
      url = `${parsedSrc.url}/get/${hash}.tar.gz`;
    } else {
      url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
    }

    const destPath = path.join(destination);
    const fileName = `${hash}.tar.gz`;
    const destPathWithFile = `${destPath}/${fileName}`;

    Utils.makeParentDir(destPath);

    this.verbose(`Downloading from "${url}`);
    await Utils.downloadFile(url, destPathWithFile, this.opts.proxy);

    this.verbose(`Extracting from "${destPathWithFile}`);
    await this.extractTar(destPathWithFile, destPath, subDirectory);

    await fs.promises.rm(destPathWithFile, {
      force: true,
      recursive: true,
    });
  }

  private async extractTar(file: string, dest: string, subDir?: string) {
    return new Promise<void>((resolve, reject) => {
      tar
        .x({
          file,
          cwd: dest,
          strip: subDir ? subDir.split('/').length : 1,
          filter: (p: string) => !subDir || p.startsWith(subDir),
        })
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  }

  private async cloneWithGit(src: string, dest: string) {
    this.verbose('Cloning...');
    await shellExec(`git clone --depth 1 ${src} ${dest}`);
    this.verbose('Delete .git folder');
    await fs.promises.rm(path.resolve(dest, '.git'), {
      force: true,
      recursive: true,
    });
  }

  public useTemplate(template: string) {
    this.getOrSetSource(Utils.getTemplateIfExists(template));
    this.isUsingTemplate = true;
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

  public verbose(...args: unknown[]): void {
    if (this.opts.verbose) logger.debug(...args);
  }

  public getOrSetDestination(destination?: string): string {
    if (!this.destination && destination) this.destination = path.resolve(destination);
    if (!this.destination && !destination) {
      throw new Error('Destination not set');
    }
    return this.destination!;
  }

  public getOrSetSource(src?: string): string {
    if (!this.src && src) this.src = src;
    if (!this.src && !src) {
      throw new Error('Source not set');
    }
    return this.src!;
  }

  public setForceMode(force: boolean) {
    this.forceMode = force;
  }

  public setVerboseMode(verbose: boolean) {
    this.opts.verbose = verbose;
  }

  public setProxy(proxy: string) {
    this.opts.proxy = proxy;
  }

  public setMode(mode: FreshlandMode) {
    if (Constants.SupportedModes.has(mode)) {
      this.mode = mode;
    } else {
      throw new Error('Invalid mode. Possible modes: tar, git');
    }
  }

  public get options(): Readonly<FreshlandOptions> {
    return this.opts;
  }
}

export default Freshland;
