import type Freshland from '..';

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
			throw new Error(`Dependency '${name}' not found in container.`);
		}
		return this.dependencies.get(name) as Dependencies[T];
	}
}
export default DependencyContainer;
