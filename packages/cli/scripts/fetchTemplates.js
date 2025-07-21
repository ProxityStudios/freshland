/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const TemplatesRepositoryURI =
  'https://raw.githubusercontent.com/ProxityStudios/repick-templates/refs/heads/main/templates.json';

// TODO: Code a download manager
// FIXME: do not download cached file
async function download(url, saveTo) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Repick/4.0.0',
      },
    };

    const request = https.get(url, options, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, saveTo).then(resolve).catch(reject);
        request.destroy();
        return;
      }

      const fileStream = fs.createWriteStream(saveTo);

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

async function fetchTemplates() {
  const filePath = path.join(__dirname, '../.data/templates.json');
  fs.unlink(filePath, () => {
    console.log(filePath, 'done');
  });
  download(TemplatesRepositoryURI, filePath);
}

fetchTemplates();
