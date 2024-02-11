import Freshland from '.';
import DependencyContainer from './utils/dependency-container';

const container = new DependencyContainer();
container.register('freshland', new Freshland());

export default container;
