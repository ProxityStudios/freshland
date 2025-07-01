import Freshland from './freshland';

// eslint-disable-next-line @typescript-eslint/naming-convention
let _freshland: Freshland;
function getFreshlandOrCreate() {
  if (!_freshland) {
    _freshland = new Freshland();
  }

  return _freshland;
}

export const freshland = getFreshlandOrCreate();
