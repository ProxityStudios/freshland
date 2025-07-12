import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { FreshlandParser } from './utils/parser';
import { FreshlandEmitter } from './emitter';
import { checkDirIsEmptyOrThrow, downloadFile, extractTar, getBuilderData, makeParentDirOrThrow } from './utils';
import type { FreshlandBuilder, FreshBuilderData } from '../structures/freshlandBuilder';
import type { FreshlandOptions, Ref, RefArray, PlatformSource } from '../types';
import { FreshlandError } from '../structures/freshlandError';
import { ProcessStatus } from '../enums';

// TODO: handle errors gracefully & implement own error system
export class Freshland {
  public readonly events: FreshlandEmitter;

  public verboseMode: boolean;

  constructor(public readonly options: FreshlandOptions = { verbose: false, globalProxy: undefined }) {
    this.events = new FreshlandEmitter();
    this.verboseMode = true; // options.verbose;

    this.loadGlobalProxy();
  }

  public async clone(builder: FreshlandBuilder | FreshBuilderData) {
    console.log('Cloning...');
    try {
      const builderData = getBuilderData(builder);

      const isEmptyDir = await checkDirIsEmptyOrThrow(builderData.destination);

      if (!isEmptyDir && !builderData.force) {
        throw new FreshlandError(
          'Destination isn\'t empty, aborting the process. (use "<FreshBuilder>.setForce(true)" or provide "--force" flag to bypass)',
          'DESTINATION_NOT_EMPTY'
        );
      }

      switch (builderData.mode) {
        case 'tar':
          this.verbose('Choosen Mode:', builderData.mode);
          await this.cloneUsingTar(builderData);
          break;
        default:
          throw new FreshlandError(`Mode "${builderData.mode}" not supported yet`, 'INVALID_MODE');
      }
    } catch (err) {
      const error = err as FreshlandError;
      console.error(error.toString());
      process.exit(ProcessStatus.ERROR);
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
    await downloadFile(url, destinationWithFileName, this.options.globalProxy ?? builderData.proxy);

    this.verbose(`Extracting from "${destinationWithFileName}`);
    // FIXME: subDirectory only works on Github repos
    await extractTar(destinationWithFileName, builderData.destination, subDirectory);

    this.verbose(`Removing copy of downloaded repository: "${destinationWithFileName}`);
    await fs.promises.unlink(destinationWithFileName);
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

  // TODO: implement other platforms & use REST API instead of git ls-remote
  // FIXME: validate source.url incase of injection attacks
  private async fetchGithubRefsOrThrow(source: PlatformSource): Promise<RefArray> {
    const lsRemote = spawn('git', ['ls-remote', source.url], { shell: true });

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      lsRemote.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      lsRemote.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      lsRemote.on('close', (code) => {
        if (code !== 0) {
          reject(new FreshlandError(`git ls-remote failed with code ${code}: ${stderr}`, 'FETCH_ERROR'));
        } else {
          resolve(this.parseRefs(stdout));
        }
      });
    });
  }

  private parseRefs(stdout: string): RefArray {
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
    if (this.verboseMode) console.debug('VERBOSE', ...args);
  }

  public setVerboseMode(verbose: boolean) {
    this.verboseMode = verbose;
  }

  setGlobalProxy(proxy: string) {
    this.options.globalProxy = proxy;
    fs.writeFileSync(
      path.resolve(__dirname, '../../local-data/proxy.json'),
      JSON.stringify({ globalProxy: proxy }, null, 2)
    );
  }

  clearGlobalProxy() {
    this.options.globalProxy = undefined;
    fs.writeFileSync(
      path.resolve(__dirname, '../../local-data/proxy.json'),
      JSON.stringify({ globalProxy: undefined }, null, 2)
    );
  }

  loadGlobalProxy() {
    try {
      const data = fs.readFileSync(path.resolve(__dirname, '../../local-data/proxy.json'), 'utf-8');
      this.options.globalProxy = JSON.parse(data).globalProxy;
    } catch {
      // file not found or invalid, ignore
    }
  }
}

export default Freshland;
