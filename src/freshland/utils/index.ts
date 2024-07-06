import { HttpsProxyAgent } from 'https-proxy-agent';
import * as tar from 'tar';
import URL from 'url';

import * as https from 'https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Builder, BuilderData } from './builder';
import Constants from '../../constants';

class Utils {
  static getTemplateIfExists(templateSource: string): string {
    const found = Object.entries(Constants.Templates).find(([, val]) => val === templateSource);

    if (!found) {
      throw new Error(`Invalid template ${templateSource}`);
    }

    return found[1];
  }

  static async checkDirIsEmpty(dir: string): Promise<boolean> {
    try {
      const files = await fs.promises.readdir(dir);
      return files.length ? false : true;
    } catch (error) {
      if ((error as any).code === 'ENOENT') return true;
      throw error;
    }
  }

  static downloadFile(url: string, saveTo: string, proxy?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        headers: {
          'User-Agent': 'Freshland/4.0',
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
          Utils.downloadFile(response.headers.location, saveTo, proxy).then(resolve).catch(reject);
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

  static getProxyRequestOptions(url: string, proxy: string): https.RequestOptions {
    const parsedUrl = URL.parse(url);
    return {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      agent: new HttpsProxyAgent(proxy),
    };
  }

  static async makeParentDir(dir: string) {
    const parent = path.dirname(dir);
    if (parent === dir) return;

    try {
      await this.makeParentDir(parent);
      await fs.promises.mkdir(dir);
    } catch (err) {
      if ((err as any).code !== 'EEXIST') {
        throw err;
      }
    }
  }

  static async extractTar(file: string, dest: string, subDir?: string) {
    return new Promise<void>((resolve, reject) => {
      tar
        .x({
          file,
          cwd: dest,
          strip: subDir ? subDir.split('/').length : 1,
          filter: (p: string) => !subDir || p.startsWith(subDir),
        })
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  }

  static getBuilderData(builder: Builder | BuilderData): BuilderData {
    return builder instanceof Builder ? builder.toJSON() : builder;
  }
}

export default Utils;
