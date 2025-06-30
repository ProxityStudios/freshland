import Freshland from './freshland';

let _freshland: Freshland;
function getFreshlandOrCreate() {
  if (!_freshland) {
    _freshland = new Freshland();
  }

  return _freshland;
}

export const freshland = getFreshlandOrCreate();
