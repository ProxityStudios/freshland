import fs from 'node:fs';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import URL from 'url';

import path from 'node:path';
import Constants from './constants';
import { logger } from './logger';
import FLError from '../exceptions/FLError';
import type Freshland from '..';

class Utils {
	static getTemplateIfExists(templateSource: string): string {
		const found = Object.entries(Constants.Templates).find(
			([, val]) => val === templateSource
		);

		if (!found) {
			throw new FLError(
				`Invalid template ${templateSource}`,
				'INVALID_TEMPLATE'
			);
		}

		return found[1];
	}

	static checkDirIsEmpty(dir: string, force: boolean) {
		try {
			const files = fs.readdirSync(dir);
			if (files.length > 0) {
				if (force) {
					logger.warn(
						'Destination directory is not empty. skipping (force mode enabled)'
					);
				} else {
					throw new FLError(
						'Destination directory is not empty, aborting.',
						'DEST_NOT_EMPTY',
						'Use Freshland.setForce ("--force" flag) to continue'
					);
				}
			}
		} catch (err: any) {
			if (err.code !== 'ENOENT') {
				throw new FLError('Destination not empty', 'NOT_EMPTY', err);
			}
		}
	}

	static download(
		url: string,
		dest: string,
		freshland: Freshland
	): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const parsedUrl = URL.parse(url);

			const requestOptions: https.RequestOptions = freshland.options.proxy
				? Utils.getProxyRequestOptions(url, freshland.options.proxy)
				: {
						...parsedUrl,
						headers: {
							'User-Agent': 'freshland',
						},
					};

			https
				.get(requestOptions, (response) => {
					const statusCode = response.statusCode ?? 0;

					if (statusCode >= 400) {
						const error = new FLError(
							`HTTP request failed with status code ${statusCode}`,
							'HTTP_REQUEST_FAILED',
							undefined,
							statusCode
						);
						reject(error);
						return;
					}

					if (statusCode >= 300 && statusCode < 400) {
						const redirectUrl = response.headers?.location;
						if (!redirectUrl) {
							const error = new FLError(
								'Redirect URL not found',
								'URL_NOT_FOUND'
							);
							reject(error);
							return;
						}
						resolve(Utils.download(redirectUrl, dest, freshland));
						return;
					}

					const destDirectory = path.dirname(dest);
					fs.promises
						.mkdir(destDirectory, { recursive: true })
						.then(() => {
							const totalSize = parseInt(
								response.headers['content-length'] ?? '0',
								10
							);
							let downloadedSize = 0;

							if (!totalSize || Number.isNaN(totalSize)) {
								freshland.verbose(
									'Total size unknown. Cannot calculate download percentage.'
								);
							}

							const destStream = fs.createWriteStream(dest);
							response.on('data', (chunk) => {
								downloadedSize += chunk.length;
								const percentage = totalSize
									? Math.round((downloadedSize / totalSize) * 100)
									: 0;
								freshland.verbose(`Downloaded ${percentage}%`);
							});

							response.pipe(destStream);
							destStream.on('finish', () => {
								destStream.close();
								resolve();
							});
							destStream.on('error', (err) => {
								reject(err);
							});
						})
						.catch((err) => {
							reject(err);
						});
				})
				.on('error', (err) => {
					const error = new FLError(
						'An error occured while downloading',
						'UNKNOWN_ERROR',
						err
					);
					reject(error);
				});
		});
	}

	static getProxyRequestOptions(
		url: string,
		proxy: string
	): https.RequestOptions {
		const parsedUrl = URL.parse(url);
		return {
			hostname: parsedUrl.hostname,
			path: parsedUrl.pathname,
			agent: new HttpsProxyAgent(proxy),
		};
	}

	static makeParentDir(dir: string) {
		const parent = path.dirname(dir);
		if (parent === dir) return;

		Utils.makeParentDir(parent);

		try {
			fs.mkdirSync(dir);
		} catch (err: any) {
			if (err.code !== 'EEXIST') {
				throw new FLError('An error occured', '', err);
			}
		}
	}
}

export default Utils;
