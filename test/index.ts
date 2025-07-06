import { Freshland } from '../src/freshland/index';
import { FreshBuilder } from '../src/structures/FreshBuilder';

const freshland = new Freshland({ verbose: true });

const builder = new FreshBuilder()
  .setSource(
    // 'https://gitlab.com/craig.white/express-typescript-starter-api#70cfdb05971aac1396dfdef57766f55cef06559aa'
    'https://bitbucket.org/alexinhans/test'
  )
  .setDestination('./tests/zing')
  .setForce(true);
// .setProxy('http://192.168.1.2:403');

// freshland.events.on('successClone', (builderData) => {
//   logger.info('OK.', builderData);
// });

// freshland.events.on('error', (err) => {
//   logger.error('Error.', err);
// });

freshland
  .clone(builder)
  .then((t) => {
    console.log('Status:', t);
  })
  .catch((e) => {
    console.error(e);
  });
