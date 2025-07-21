const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const dataDirectory = path.resolve(__dirname, '..', '.data');

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  console.log(`Data directory created at: ${dataDirectory}`);
} else {
  console.log(`Data directory already exists: ${dataDirectory}`);
}
