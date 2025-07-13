#!/usr/bin/env node_modules/.bin/ts-node-esm
(async () => {
  const oclif = await import('@oclif/core');
  await oclif.execute({ development: true, dir: __dirname });
})();
