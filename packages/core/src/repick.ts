import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import { Parser } from './utils/parser';
import { Emitter } from './emitter';
import { checkDirectoryIsEmpty, downloadFile, extractTarToDestination, getBuilderData, makeParentDirOrThrow } from './utils';
import type { Builder } from './structures/Builder';
import { RepickError, ProcessStatus, type CoreOptions, type Ref, type RefArray, type PlatformSource, type BuilderData } from '@repick/common';
import { ProxyConfigRAWDataPath } from './paths';

// TODO: handle errors gracefully & implement own error system
export class Repick {
  public readonly events: Emitter;

  public verboseMode: boolean;

  constructor(public readonly options: CoreOptions = { verbose: false, globalProxy: undefined }) {
    this.verboseMode = options.verbose;
    
    this.events = new Emitter();

    this.loadGlobalProxy();
  }

  public async clone(builder: Builder | BuilderData) {
    console.log('Cloning...');
    try {
      const builderData = getBuilderData(builder);

      const isEmptyDir = await checkDirectoryIsEmpty(builderData.destination);

      if (!isEmptyDir && !builderData.force) {
        throw new RepickError(
          'Destination isn\'t empty, aborting the process. (use "<FreshBuilder>.setForce(true)" or provide "--force" flag to bypass)',
          'DESTINATION_NOT_EMPTY'
        );
      }

      switch (builderData.mode) {
        case 'tar':
          this.verbose('Choosen Mode:', builderData.mode);
          const result = await this.cloneUsingTar(builderData);
          return result;
        default:
          throw new RepickError(`Mode "${builderData.mode}" not supported yet`, 'INVALID_MODE');
      }
    } catch (err) {
      const error = err as RepickError;
      console.error(error.toString());
      process.exit(ProcessStatus.ERROR);
    }
  }

  private async cloneUsingTar(builderData: BuilderData) {
    const parsedSrc = Parser.parseSourceOrThrow(builderData.source);
    
    let fileName: string = `${parsedSrc.ref}.tar.gz`;
    let subDirectory: string | undefined;
    let url: string;

    // TODO: allow to clone a branch from other platforms E.G: gitlab.com/proxitystudios/typescript-starter#anotherBranch
    if (parsedSrc.site === 'gitlab') {
      url = `${parsedSrc.urlWithoutRepoAndUsername}/api/v4/projects/${parsedSrc.userName}%2F${parsedSrc.repoName}/repository/archive.tar.gz?sha=${parsedSrc.ref}`;
    } else if (parsedSrc.site === 'bitbucket') {
      url = `${parsedSrc.url}/get/${parsedSrc.ref}.tar.gz`;
    } else {
      const hash = await this.getCommitHash(parsedSrc);
      if (!hash) throw new RepickError(`Could not find the commit hash for ${parsedSrc.ref}`, 'HASH_NOT_FOUND');

      subDirectory = parsedSrc.subDirectory ? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}` : undefined;

      fileName = `${hash}.tar.gz`;
      url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
    }

    const destinationWithFileName = `${builderData.destination}/${fileName}`;

    this.verbose(`Creating parent directory`);
    await makeParentDirOrThrow(builderData.destination);

    this.verbose(`Downloading from "${url}`);
    const downloadedFilePath = await downloadFile(url, destinationWithFileName, this.options.globalProxy ?? builderData.proxy);

    this.verbose(`Extracting from "${downloadedFilePath}`);
    // FIXME: subDirectory only works on Github repos
    await extractTarToDestination(downloadedFilePath, builderData.destination, subDirectory);

    this.verbose(`Removing copy of downloaded repository: "${downloadedFilePath}`);
    await fs.promises.unlink(downloadedFilePath);

    return {
      mode: builderData.mode,
      source: builderData.source,
      destination: builderData.destination,
      force: builderData.force,
      proxy: builderData.proxy,
    }
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
          reject(new RepickError(`git ls-remote failed with code ${code}: ${stderr}`, 'FETCH_ERROR'));
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

  setGlobalProxy(globalProxy: string) {
    this.options.globalProxy = globalProxy;
    fs.writeFileSync(ProxyConfigRAWDataPath, JSON.stringify({ globalProxy }, null, 2));
  }

  clearGlobalProxy() {
    this.options.globalProxy = undefined;
    fs.writeFileSync(ProxyConfigRAWDataPath, JSON.stringify({ globalProxy: undefined }, null, 2));
  }

  loadGlobalProxy() {
    try {
      const data = fs.readFileSync(ProxyConfigRAWDataPath, 'utf-8');
      this.verbose('Loading global proxy:', data);
      this.options.globalProxy = JSON.parse(data).globalProxy;
    } catch {
      // file not found or invalid, ignore
    }
  }
}

export default Repick;
