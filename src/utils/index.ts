import fs from 'node:fs';
import https from 'https';
import URL from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';

import path from 'node:path';
import Constants from './constants';
import { logger } from './logger';

export function getTemplateIfExists(templateSource: string): string {
	const found = Object.entries(Constants.Templates).find(
		([key, val]) => val === templateSource
	);

	if (!found) {
		throw new Error('Invalid template');
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
				throw new Error(
					'Destination directory is not empty, aborting. Use Freshland.setForce ("--force" flag) to override'
				);
			}
		}
	} catch (err: any) {
		if (err.code !== 'ENOENT') throw err;
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
					const error = new Error(
						`HTTP request failed with status code ${statusCode}`
					);
					reject(error);
					return;
				}

				if (statusCode >= 300 && statusCode < 400) {
					const redirectUrl = response.headers?.location;
					if (!redirectUrl) {
						const error = new Error('Redirect URL not found');
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
					logger.info('An error occured while downloading', err);

					reject(err);
				});
			})
			.on('error', (err) => {
				reject(err);
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
		path: parsedUrl.path,
		agent: new HttpsProxyAgent(proxy),
	};
}

export function mkdirp(dir: string) {
	const parent = path.dirname(dir);
	if (parent === dir) return;

	mkdirp(parent);

	try {
		fs.mkdirSync(dir);
	} catch (err: any) {
		if (err.code !== 'EEXIST') throw err;
	}
}
