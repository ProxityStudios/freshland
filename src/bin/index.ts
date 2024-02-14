import Freshland from '..';
import { startProgram } from './bin';
import container from './root';

container.register('freshland', new Freshland());

startProgram();
