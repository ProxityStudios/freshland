#!/usr/bin/env node

// eslint-disable-next-line
(async () => {
  const oclif = await import('@oclif/core');
  await oclif.execute({ dir: __dirname });
})();
