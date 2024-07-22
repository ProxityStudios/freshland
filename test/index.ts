import { Freshland } from '../src/freshland/index';
import { Builder } from '../src/freshland/utils/builder';
import { logger } from '../src/root/logger';

const freshland = new Freshland({ verbose: true });

const builder = new Builder()
  .setRepository('proxitystudios/typescript-starter')
  .setDestination('./tests/zing')
  .setForce(true);

freshland.emitter.on('finish', (builderData) => {
  logger.info('OK.', builderData);
});

freshland.clone(builder);
