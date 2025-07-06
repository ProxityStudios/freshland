import { HttpsProxyAgent } from 'https-proxy-agent';
import * as tar from 'tar';
import URL from 'url';

import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { FreshBuilder, FreshBuilderData } from '../../structures/FreshBuilder';
import templatesData from '../../../local-data/templates.json';
import { Template, TemplateKeysWithS, TemplateWithoutName } from '../../types';

export function getTemplateIfExists(templateKey: TemplateKeysWithS) {
  const simplifiedTemplates: Template[] = Object.entries<TemplateWithoutName>(templatesData as any).map(
    ([name, data]) => ({
      name,
      ...data,
    })
  );

  const foundTemplate = simplifiedTemplates.find((t) => t.name === templateKey);

  if (!foundTemplate) {
    throw new Error(`[INVALID_TEMPLATE] Invalid template ${String(templateKey)}`);
  }

  return foundTemplate;
}

export async function checkDirIsEmpty(dir: string): Promise<boolean> {
  try {
    const files = await fs.promises.readdir(dir);
    return files.length ? false : true;
  } catch (error) {
    if ((error as any).code === 'ENOENT') return true;
    throw error;
  }
}

// FIXME: abort downloading when the terminal process canceled
export function downloadFile(url: string, saveTo: string, proxy?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      headers: {
        'User-Agent': 'Freshland/4.0.0',
      },
    };

    if (proxy) {
      options.agent = new HttpsProxyAgent(proxy, {
        rejectUnauthorized: true,
      }) as https.Agent;
    }

    const request = https.get(url, options, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, saveTo, proxy).then(resolve).catch(reject);
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

export function getProxyRequestOptions(url: string, proxy: string): https.RequestOptions {
  const parsedUrl = URL.parse(url);
  return {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname,
    agent: new HttpsProxyAgent(proxy) as https.Agent,
  };
}

export async function makeParentDir(dir: string) {
  const parent = path.dirname(dir);
  if (parent === dir) return;

  try {
    await makeParentDir(parent);
    await fs.promises.mkdir(dir);
  } catch (err) {
    if ((err as any).code !== 'EEXIST') {
      throw err;
    }
  }
}

export async function extractTar(file: string, to: string, subDir?: string) {
  return new Promise<void>((resolve, reject) => {
    tar
      .x({
        file,
        cwd: to,
        strip: subDir ? subDir.split('/').length : 1,
        filter: (p: string) => !subDir || p.startsWith(subDir),
      })
      .then(() => resolve())
      .catch((error) => reject(error));
  });
}

export function getBuilderData(builder: FreshBuilder | FreshBuilderData): FreshBuilderData {
  return builder instanceof FreshBuilder ? builder.toJSON() : builder;
}
