import { Freshland } from '../src/freshland/index';
import { logger } from '../src/logger';
import { FreshBuilder } from '../src/structure/FreshBuilder';

const freshland = new Freshland({ verbose: true });

const builder = new FreshBuilder()
  .setRepository('proxitystudios/typescript-starter')
  .setDestination('./tests/zing')
  .setForce(true);

freshland.emitter.on('successClone', (builderData) => {
  logger.info('OK.', builderData);
});

freshland.clone(builder);
