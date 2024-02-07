import EventEmitter from 'events';
import path from 'node:path';
import shellExec from 'shell-exec';
import { logger } from './utils/logger';
import { getTemplateIfExists } from './utils';
import Constants from './utils/constants';

interface FreshlandOptions {
	verbose?: true;
}

type FreshlandMode = 'tar' | 'git';
export class Freshland extends EventEmitter {
	logger = logger;

	forceMode = false;

	src?: string;

	isUsingTemplate = false;

	destination?: string;

	// TODO: tar should be default mode because of performance issues
	mode: FreshlandMode = 'git';

	constructor(private options: FreshlandOptions = {}) {
		super();
	}

	async start(destination?: string, source?: string) {
		const dest = this.getOrSetDestination(destination);
		const src = this.getOrSetSource(source);

		if (this.mode === 'tar') {
			// TODO: implemet tar cloning
		} else if (this.mode === 'git') {
			const cloneResult = await shellExec(
				`git clone --depth 1 ${src} ${dest}`
			); // error code: 128

			if (cloneResult.code === 128 && !this.forceMode) {
				logger.error(
					"Destination folder isn't empty (use force mode to continue)"
				);
				process.exit(Constants.ProcessStatus.FAIL);
			} else {
				// TODO: clone into a non empty dir using git mode
			}

			// TODO: error handlinf
			await shellExec(`rm -rf ${path.resolve(dest, '.git')}`);
		}
	}

	useTemplate(template: string) {
		this.getOrSetSource(getTemplateIfExists(template));
		this.isUsingTemplate = true;
	}

	// Ott
	verbose(...args: unknown[]): void {
		if (this.options?.verbose) logger.debug(...args);
	}

	/*
	get src(): string | null {
		if (!this.src) {
			throw new Error('Source not settled. (use Freshland.getOrSetSource)');
		}

		return this.src;
	}

	get destination(): string {
		if (!this.destination) {
			throw new Error(
				'Destination not settled. (use Freshland.getOrSetDestination)'
			);
		}

		return this.destination;
	}
	*/

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
}
export default Freshland;
