import EventEmitter from 'events';
import tar from 'tar';
import path from 'node:path';
import shellExec from 'shell-exec';
import { logger } from './utils/logger';
import {
	checkDirIsEmpty,
	download,
	getTemplateIfExists,
	mkdirp,
} from './utils';
import type { FreshlandMode, FreshlandOptions, Refs } from './types';
import Parser, { RepositoryInfo } from './utils/parser';

export class Freshland extends EventEmitter {
	logger = logger;

	forceMode = false;

	src?: string;

	destination?: string;

	isUsingTemplate = false;

	mode: FreshlandMode = 'tar';

	constructor(private options: FreshlandOptions = { verbose: false }) {
		super();
	}

	async start(source?: string, destination?: string) {
		const src = this.getOrSetSource(source);
		const dest = this.getOrSetDestination(destination);

		checkDirIsEmpty(dest, this.forceMode);

		switch (this.mode) {
			case 'tar':
				await this.cloneWithTar(src, dest);

				break;

			case 'git':
				await this.cloneWithGit(src, dest);
				break;

			default:
				break;
		}
	}

	async cloneWithTar(src: string, destination: string) {
		const parsedSrc = Parser.parseSource(src);
		const hash = await this.getHash(parsedSrc);

		const subDirectory = parsedSrc.subDirectory
			? `${parsedSrc.repoName}-${hash}${parsedSrc.subDirectory}`
			: undefined;

		if (!hash) {
			throw new Error(`Couldn't find commit hash for ${parsedSrc.ref}`);
		}
		const tempFile = `${destination}/.tmp/${hash}.tar.gz`;

		let url: string;
		if (parsedSrc.site === 'gitlab') {
			url = `${parsedSrc.url}/repository/archive.tar.gz?ref=${hash}`;
		} else if (parsedSrc.site === 'bitbucket') {
			url = `${parsedSrc.url}/get/${hash}.tar.gz`;
		} else {
			url = `${parsedSrc.url}/archive/${hash}.tar.gz`;
		}

		await download(url, tempFile, this.options.proxy);

		mkdirp(destination);

		await this.untar(tempFile, destination, subDirectory);
		await shellExec(`rm -rf ${tempFile}`);
	}

	async untar(file: string, dest: string, subdir?: string) {
		return tar.extract(
			{
				file,
				strip: subdir ? subdir.split('/').length : 1,
				C: dest,
			},
			subdir ? [subdir] : []
		);
	}

	async cloneWithGit(src: string, dest: string) {
		await shellExec(`git clone --depth 1 ${src} ${dest}`); // dir not empty error code: 128
		await shellExec(`rm -rf ${path.resolve(dest, '.git')}`);
	}

	useTemplate(template: string) {
		this.getOrSetSource(getTemplateIfExists(template));
		this.isUsingTemplate = true;
	}

	async getHash(source: RepositoryInfo): Promise<string | null> {
		try {
			const refs = await this.fetchRefs(source);

			if (source.ref === 'HEAD') {
				return refs.find((ref) => ref.type === 'HEAD')!.hash;
			}
			return this.selectRef(refs, source.ref);
		} catch (err: any) {
			this.logger.error(err);
			return null;
		}
	}

	selectRef(refs: Refs, selector: string): string | null {
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

	async fetchRefs(source: RepositoryInfo): Promise<Refs> {
		try {
			const { stdout } = await shellExec(`git ls-remote ${source.url}`);
			return stdout
				.split('\n')
				.filter(Boolean)
				.map((row) => {
					const [hash, ref] = row.split('\t');

					if (ref === 'HEAD') {
						return {
							type: 'HEAD',
							hash,
						};
					}

					const [, type, name] = /refs\/(\w+)\/(.+)/.exec(ref) ?? [];
					if (!type || !name) {
						this.logger.error(row);
						throw new Error(`Could not parse ${ref}`);
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
				});
		} catch (error: any) {
			this.logger.error(error);
			throw new Error(`Could not fetch remote ${source.url}`);
		}
	}

	verbose(...args: unknown[]): void {
		if (this.options.verbose) this.logger.debug(...args);
	}

	getOrSetDestination(destination?: string): string {
		if (!this.destination && destination)
			this.destination = path.resolve(destination);
		if (!this.destination && !destination) {
			throw new Error('Destination not settled');
		}
		return this.destination!;
	}

	getOrSetSource(src?: string): string {
		if (!this.src && src) this.src = src;
		if (!this.src && !src) {
			throw new Error('Source not settled');
		}
		return this.src!;
	}

	setForceMode(force: boolean) {
		this.forceMode = force;
	}

	setVerboseMode(verbose: boolean) {
		this.options.verbose = verbose;
	}

	setProxy(proxy: string) {
		this.options.proxy = proxy;
	}

	setMode(mode: FreshlandMode) {
		if (mode === 'tar' || mode === 'git') {
			this.mode = mode;
		} else {
			throw new Error(
				'Invalid mode (Freshland supports only "tar" and "git")'
			);
		}
	}
}
export default Freshland;
