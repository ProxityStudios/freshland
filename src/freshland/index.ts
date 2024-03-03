import EventEmitter from 'events';
import tar from 'tar';
import path from 'path';
import shellExec from 'shell-exec';
import { logger } from '../root/logger';
import {
	FreshlandMode,
	FreshlandOptions,
	Ref,
	RefArray,
	RepositorySource,
} from './types';
import Parser from './utils/parser';
import FLError from '../exceptions/FLError';
import Utils from './utils';
import Constants from '../constants';

class Freshland extends EventEmitter {
	protected forceMode = false;

	protected src?: string;

	protected destination?: string;

	protected isUsingTemplate = false;

	protected mode: FreshlandMode = 'tar';

	constructor(public opts: FreshlandOptions = { verbose: false }) {
		super();
	}

	// eslint-disable-next-line consistent-return
	async startProcess(source?: string, destination?: string) {
		try {
			const src = this.getOrSetSource(source);
			const dest = this.getOrSetDestination(destination);

			Utils.checkDirIsEmpty(dest, this.forceMode);

			logger.info('Freshland doing some fresh things...');
			switch (this.mode) {
				case 'tar':
					this.verbose('Mode:', this.mode);
					await this.cloneWithTar(src, dest);
					break;
				case 'git':
					this.verbose('Mode:', this.mode);
					await this.cloneWithGit(src, dest);
					break;
				default:
					// unneccesary but ok
					throw new FLError('Invalid mode', 'INVALID_MODE');
			}

			logger.info('Done, you are ready to code!');
			this.emit('done');
		} catch (error) {
			logger.error(error instanceof FLError ? error.message : error);
			return Promise.resolve();
		}
	}

	private async cloneWithTar(src: string, destination: string) {
		const parsedSrc = Parser.parseSource(src);
		const hash = await this.getCommitHash(parsedSrc);
		const subDirectory = parsedSrc.subDirectory
			? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}`
			: undefined;

		if (!hash) {
			throw new FLError(
				`Couldn't find commit hash for ${parsedSrc.ref}`,
				'HASH_NOT_FOUND'
			);
		}

		const tmpDir = path.join(destination, '.tmp');
		const tmpFile = path.join(tmpDir, `${hash}.tar.gz`);

		let url: string;
		if (parsedSrc.site === 'gitlab') {
			url = `${parsedSrc.url}/repository/archive.tar.gz?ref=${hash}`;
		} else if (parsedSrc.site === 'bitbucket') {
			url = `${parsedSrc.url}/get/${hash}.tar.gz`;
		} else {
			url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
		}

		this.verbose('Downloading...', url);
		await Utils.download(url, tmpFile, this.opts.proxy);

		Utils.makeParentDir(destination);

		this.verbose('Extracting...');
		await this.extractTar(tmpFile, destination, subDirectory);

		await Utils.deleteDir(tmpDir);
	}

	private async extractTar(file: string, dest: string, subDir?: string) {
		return new Promise<void>((resolve, reject) => {
			tar.extract({
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
		await Utils.deleteDir(path.resolve(dest, '.git'));
	}

	public useTemplate(template: string) {
		this.getOrSetSource(Utils.getTemplateIfExists(template));
		this.isUsingTemplate = true;
	}

	private async getCommitHash(
		source: RepositorySource
	): Promise<string | null> {
		try {
			const refs = await this.fetchRefs(source);

			if (source.ref === 'HEAD') {
				const hash = refs.find((ref) => ref.type === 'HEAD')?.hash;
				this.verbose('HEAD hash:', hash);
				return hash ?? null;
			}
			return this.findCommitHash(refs, source.ref);
		} catch (error) {
			throw new FLError(
				'Failed to get commit hash',
				'GET_COMMIT_HASH_ERROR',
				error
			);
		}
	}

	private findCommitHash(refs: RefArray, selector: string): string | null {
		const matchingRef = refs.find((ref) => ref.name === selector);
		if (matchingRef) {
			this.verbose(`Found matching commit hash: ${matchingRef.hash}`);
			return matchingRef.hash;
		}

		if (selector.length < 8) return null;

		const refWithMatchingStart = refs.find((ref) =>
			ref.hash.startsWith(selector)
		);

		return refWithMatchingStart?.hash ?? null;
	}

	private async fetchRefs(source: RepositorySource): Promise<RefArray> {
		try {
			const { stdout } = await shellExec(`git ls-remote ${source.url}`);
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
		} catch (error) {
			throw new FLError(
				`Could not fetch remote ${source.url}`,
				'FETCH_REF_ERROR',
				error
			);
		}
	}

	public verbose(...args: unknown[]): void {
		if (this.opts.verbose) logger.debug(...args);
	}

	public getOrSetDestination(destination?: string): string {
		if (!this.destination && destination)
			this.destination = path.resolve(destination);
		if (!this.destination && !destination) {
			throw new FLError('Destination not set', 'DESTINATION_NOT_SET');
		}
		return this.destination!;
	}

	public getOrSetSource(src?: string): string {
		if (!this.src && src) this.src = src;
		if (!this.src && !src) {
			throw new FLError('Source not set', 'SOURCE_NOT_SET');
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
			throw new FLError(
				'Invalid mode',
				'INVALID_MODE',
				'Possible modes: tar, git'
			);
		}
	}

	public get options(): Readonly<FreshlandOptions> {
		return this.opts;
	}
}

export default Freshland;
