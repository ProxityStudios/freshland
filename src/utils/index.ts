import fs from 'node:fs';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import URL from 'url';

import path from 'node:path';
import Constants from './constants';
import { logger } from './logger';
import FLError from '../exceptions/FLError';

export function getTemplateIfExists(templateSource: string): string {
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

export function checkDirIsEmpty(dir: string, force: boolean) {
	try {
		const files = fs.readdirSync(dir);
		if (files.length > 0) {
			if (force) {
				logger.warn(
					'Destination directory is not empty. (force mode enabled)'
				);
			} else {
				throw new FLError(
					'Destination directory is not empty, aborting.',
					'DEST_NOT_EMPTY',
					' Use Freshland.setForce ("--force" flag) to override'
				);
			}
		}
	} catch (err: any) {
		if (err.code !== 'ENOENT') {
			throw new FLError(
				'File/folder not exists',
				'FILE_OR_DIR_NOT_EXISTS',
				err
			);
		}
	}
}

export function download(
	url: string,
	dest: string,
	proxy?: string
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const parsedUrl = URL.parse(url);

		const requestOptions: https.RequestOptions = proxy
			? getProxyRequestOptions(url, proxy)
			: {
					...parsedUrl,
					headers: {
						'user-agent': 'freshland',
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
					resolve(download(redirectUrl, dest, proxy));
					return;
				}

				const destDirectory = path.dirname(dest);
				if (!fs.existsSync(destDirectory)) {
					fs.mkdirSync(destDirectory, { recursive: true });
				}

				const destStream = fs.createWriteStream(dest);
				response.pipe(destStream);
				destStream.on('finish', () => {
					logger.info('Downloaded');

					destStream.close(() => resolve());
				});
				destStream.on('error', (err) => {
					reject(err);
				});
			})
			.on('error', (err) => {
				const error = new FLError(
					'An error occured while downloading',
					'UNKNOWN_ERROR',
					err
				);
				logger.error(error.getErrorDetails());
				reject(error);
			});
	});
}

function getProxyRequestOptions(
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

export function makeParentDir(dir: string) {
	const parent = path.dirname(dir);
	if (parent === dir) return;

	makeParentDir(parent);

	try {
		fs.mkdirSync(dir);
	} catch (err: any) {
		if (err.code !== 'EEXIST') {
			throw new FLError('An error occured', 'FILE_OR_DIR_NOT_EXISTS', err);
		}
	}
}
