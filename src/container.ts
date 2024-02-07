import Freshland from '.';
import DependencyContainer from './utils/dependency-container';

const container = new DependencyContainer();
container.register('freshland', new Freshland({ verbose: true }));

export default container;
