import { HttpsProxyAgent } from 'https-proxy-agent';
import URL from 'url';

import * as https from 'https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import Constants from '../../constants';
import FLError from '../../exceptions/FLError';
import { logger } from '../../root/logger';

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
		} catch (err) {
			/* empty */
		}
	}

	static downloadFile(
		url: string,
		saveTo: string,
		proxy?: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const options: https.RequestOptions = {
				headers: {
					'User-Agent': 'Mozilla/5.0',
				},
			};

			if (proxy) {
				options.agent = new HttpsProxyAgent(proxy, {
					rejectUnauthorized: true,
				});
			}

			const request = https.get(url, options, (response) => {
				if (
					response.statusCode &&
					response.statusCode >= 300 &&
					response.statusCode < 400 &&
					response.headers.location
				) {
					Utils.downloadFile(response.headers.location, saveTo, proxy)
						.then(resolve)
						.catch(reject);
					request.destroy();
					return;
				}

				const dest = path.join(saveTo);
				const fileStream = fs.createWriteStream(dest);

				response.pipe(fileStream);

				fileStream.on('finish', () => {
					fileStream.close();
					resolve(saveTo);
				});

				fileStream.on('error', (error) => {
					fs.unlink(saveTo, () => {
						reject(error);
					});
				});
			});

			request.on('error', (error) => {
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
				throw new FLError('An error occured', 'UNKNOWN', err);
			}
		}
	}
}

export default Utils;
