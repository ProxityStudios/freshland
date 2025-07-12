import { HttpsProxyAgent } from 'https-proxy-agent';
import * as tar from 'tar';
import URL from 'url';

import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { FreshlandBuilder, FreshBuilderData } from '../../structures/freshlandBuilder';
import templatesRAWData from '../../../.data/templates.json';
import { TemplateKeysWithS, TemplateRAWData, Templates, TemplatesRAWData, Template } from '../../types';
import { FreshlandError } from '../../structures/freshlandError';

export function getTemplates(): Templates {
  const simplifiedTemplates: Template[] = Object.entries<TemplateRAWData>(templatesRAWData as TemplatesRAWData).map(
    ([name, data]) => ({
      name,
      ...data,
    })
  );

  return simplifiedTemplates;
}

export function getTemplateIfExistsOrThrow(templateKey: TemplateKeysWithS) {
  const simplifiedTemplates = getTemplates();

  const foundTemplate = simplifiedTemplates.find((t) => t.name === templateKey);

  if (!foundTemplate) {
    throw new FreshlandError(`Invalid template ${String(templateKey)}`, 'INVALID_TEMPLATE');
  }

  return foundTemplate;
}

export async function checkDirIsEmptyOrThrow(dir: string): Promise<boolean> {
  try {
    const files = await fs.promises.readdir(dir);
    return files.length ? false : true;
  } catch (error) {
    if ((error as any).code === 'ENOENT') return true;
    throw error;
  }
}

export async function downloadFile(url: string, saveTo: string, proxy?: string): Promise<string> {
  const options: https.RequestOptions = {
    headers: {
      'User-Agent': 'Freshland/4.0.0',
    },
  };

  if (proxy) {
    options.agent = new HttpsProxyAgent(proxy, {
      // rejectUnauthorized: true,
      timeout: 6000,
      sessionTimeout: 6000,
    }) as https.Agent;
  }

  let fileStream: fs.WriteStream | undefined;
  let aborted = false;

  return new Promise<string>((resolve, reject) => {
    console.log(`Downloading from ${url} to ${saveTo}`, options.agent ? `via proxy ${proxy}` : '');

    const request = https.get(url, options, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`Redirecting to ${response.headers.location}`);
        request.destroy();
        downloadFile(response.headers.location, saveTo, proxy).then(resolve).catch(reject);
        return;
      }

      if (proxy && [407, 502, 503, 504].includes(response.statusCode ?? 0)) {
        aborted = true;
        request.destroy();
        reject(new FreshlandError(`Received status code ${response.statusCode}`, 'PROXY_ERROR'));
        return;
      }

      const destination = path.join(saveTo);
      fileStream = fs.createWriteStream(destination);

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream?.close();
        resolve(saveTo);
      });

      fileStream.on('error', (error) => {
        fileStream?.close();
        fs.unlink(saveTo, () => {
          reject(error);
        });
      });
    });

    request.on('error', (error) => {
      if (aborted) return;

      if (fileStream) {
        fileStream.close();
        fs.unlink(saveTo, () => {
          reject(error);
        });
      } else {
        reject(error);
      }
    });

    const cleanup = () => {
      aborted = true;
      request.destroy();

      if (fileStream) {
        fileStream.close();
        fs.unlink(saveTo, () => {});
      }

      console.log('Download aborted and file removed.');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
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

export async function makeParentDirOrThrow(dir: string) {
  const parent = path.dirname(dir);
  if (parent === dir) return;

  try {
    await makeParentDirOrThrow(parent);
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

export function getBuilderData(builder: FreshlandBuilder | FreshBuilderData): FreshBuilderData {
  return builder instanceof FreshlandBuilder ? builder.toJSON() : builder;
}
