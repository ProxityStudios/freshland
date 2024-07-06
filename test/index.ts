import { Builder } from '../src/freshland/builder';
import { Freshland } from '../src/freshland/index';
import { logger } from '../src/root/logger';

const freshland = new Freshland({ verbose: true });

const builder = new Builder().setSource('proxitystudios/typescript-starter').setDestination("./tests/zing").setForce(true)

freshland.clone(builder);

freshland.emitter.on('done', () => {
  logger.info('OK.');
});
