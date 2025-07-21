/* eslint-disable @typescript-eslint/no-var-requires */
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const dataDirectory = path.join(__dirname, '..', '.data');

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  console.log(`Data directory created at: ${dataDirectory}`);
} else {
  console.log(`Data directory already exists: ${dataDirectory}`);
}

const fetchTemplatesScript = path.join(__dirname, 'fetchTemplates.js');

execFile('node', [fetchTemplatesScript], (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing fetchTemplates script: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error output: ${stderr}`);
    return;
  }
  console.log(`Fetch templates output: ${stdout}`);
});
