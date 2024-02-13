import type Freshland from '..';
import FLError from '../exceptions/FLError';

export interface Dependencies {
	freshland: Freshland;
}

class DependencyContainer {
	private dependencies = new Map<string, unknown>();

	register<T extends keyof Dependencies>(
		name: T,
		dependency: Dependencies[T]
	): void {
		this.dependencies.set(name, dependency);
	}

	resolve<T extends keyof Dependencies>(name: T): Dependencies[T] {
		if (!this.dependencies.has(name)) {
			throw new FLError(
				`Dependency '${name}' not found in container.`,
				'CONTAINER_INVALID_DEPENDENCY'
			);
		}
		return this.dependencies.get(name) as Dependencies[T];
	}
}
export default DependencyContainer;
