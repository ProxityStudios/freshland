import EventEmitter from 'events';
import tar from 'tar';
import path from 'node:path';
import shellExec from 'shell-exec';
import fs from 'node:fs';
import { logger } from './utils/logger';
import type {
	FreshlandMode,
	FreshlandOptions,
	Ref,
	RefArray,
	RepositorySource,
} from './types';
import Parser from './utils/parser';
import FLError from './exceptions/FLError';
import Utils from './utils';

export class Freshland extends EventEmitter {
	protected forceMode = false;

	protected src?: string;

	protected destination?: string;

	protected isUsingTemplate = false;

	protected mode: FreshlandMode = 'tar';

	constructor(private opts: FreshlandOptions = { verbose: false }) {
		super();
	}

	async startProcess(source?: string, destination?: string) {
		const src = this.getOrSetSource(source);
		const dest = this.getOrSetDestination(destination);

		Utils.checkDirIsEmpty(dest, this.forceMode);

		logger.info('Process started');
		switch (this.mode) {
			case 'tar':
				this.verbose('Cloning with tar');
				await this.cloneWithTar(src, dest);
				break;

			case 'git':
				this.verbose('Cloning with git');
				await this.cloneWithGit(src, dest);
				break;

			default:
				break;
		}

		logger.info('Done, you are ready to code!');
		this.emit('done');
	}

	private async cloneWithTar(src: string, destination: string) {
		const parsedSrc = Parser.parseSource(src);

		this.verbose('Getting hash');
		const hash = await this.getHash(parsedSrc);

		const subDirectory = parsedSrc.subDirectory
			? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}`
			: undefined;

		if (!hash) {
			throw new FLError(
				`Couldn't find commit hash for ${parsedSrc.ref}`,
				'HASH_NOT_FOUND'
			);
		}
		const tmp = `${destination}/.tmp`;
		const tempFile = `${tmp}/${hash}.tar.gz`;

		let url: string;
		if (parsedSrc.site === 'gitlab') {
			url = `${parsedSrc.url}/repository/archive.tar.gz?ref=${hash}`;
		} else if (parsedSrc.site === 'bitbucket') {
			url = `${parsedSrc.url}/get/${hash}.tar.gz`;
		} else {
			url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
		}

		this.verbose('URL', url);

		try {
			this.verbose('Download process started');
			await Utils.download(url, tempFile, this);
			this.verbose('Download process finished');

			Utils.makeParentDir(destination);

			this.verbose('Extracting process started');
			await this.untar(tempFile, destination, subDirectory);
			this.verbose('Extracting process finished');
		} finally {
			this.verbose('Deleting temporary folder process started');
			await fs.promises
				.rm(tmp, { force: true, recursive: true })
				.catch(console.error);
			this.verbose('Deleting temporary folder process finished');
		}
	}

	private async untar(file: string, dest: string, subdir?: string) {
		return tar.extract(
			{
				file,
				strip: subdir ? subdir.split('/').length : 1,
				C: dest,
			},
			subdir ? [subdir] : []
		);
	}

	private async cloneWithGit(src: string, dest: string) {
		await shellExec(`git clone --depth 1 ${src} ${dest}`); // dir not empty error code: 128
		await shellExec(`rm -rf ${path.resolve(dest, '.git')}`);
	}

	useTemplate(template: string) {
		this.getOrSetSource(Utils.getTemplateIfExists(template));
		this.isUsingTemplate = true;
	}

	private async getHash(source: RepositorySource): Promise<string | null> {
		try {
			const refs = await this.fetchRefs(source);

			if (source.ref === 'HEAD') {
				return refs.find((ref) => ref.type === 'HEAD')?.hash ?? null;
			}
			return this.selectRef(refs, source.ref);
		} catch (err) {
			throw new FLError('Failed to get hash', 'HASH_ERROR', err);
		}
	}

	private selectRef(refs: RefArray, selector: string): string | null {
		const matchingRef = refs.find((ref) => ref.name === selector);
		if (matchingRef) {
			this.verbose(`Found matching commit hash: ${matchingRef.hash}`);
			return matchingRef.hash;
		}

		if (selector.length < 8) return null;

		const refWithMatchingStart = refs.find((ref) =>
			ref.hash.startsWith(selector)
		);

		if (!refWithMatchingStart) return null;

		return refWithMatchingStart.hash;
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
		} catch (err) {
			throw new FLError(
				`Could not fetch remote ${source.url}`,
				'FETCH_REF',
				err
			);
		}
	}

	verbose(...args: unknown[]): void {
		if (this.opts.verbose) logger.debug(...args);
	}

	getOrSetDestination(destination?: string): string {
		if (!this.destination && destination)
			this.destination = path.resolve(destination);
		if (!this.destination && !destination) {
			throw new FLError('Destination not settled', 'DEST_NOT_SETTLED');
		}
		return this.destination!;
	}

	getOrSetSource(src?: string): string {
		if (!this.src && src) this.src = src;
		if (!this.src && !src) {
			throw new FLError('Source not settled', 'SRC_NOT_SETTLED');
		}
		return this.src!;
	}

	setForceMode(force: boolean) {
		this.forceMode = force;
	}

	setVerboseMode(verbose: boolean) {
		this.opts.verbose = verbose;
	}

	setProxy(proxy: string) {
		this.opts.proxy = proxy;
	}

	setMode(mode: FreshlandMode) {
		if (mode === 'tar' || mode === 'git') {
			this.mode = mode;
		} else {
			throw new FLError(
				'Invalid mode',
				'INVALID_MODE',
				'Possible modes: tar, git'
			);
		}
	}

	get options(): Readonly<FreshlandOptions> {
		return this.opts;
	}
}
export default Freshland;
