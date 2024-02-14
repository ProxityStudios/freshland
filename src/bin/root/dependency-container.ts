import FLError from '../../exceptions/FLError';
import { Dependencies } from '../../types';

class DependencyContainer {
	// eslint-disable-next-line no-use-before-define
	private static instance: DependencyContainer;

	private dependencies = new Map<string, unknown>();

	public static getInstance(): DependencyContainer {
		if (!DependencyContainer.instance) {
			DependencyContainer.instance = new DependencyContainer();
		}
		return DependencyContainer.instance;
	}

	register<T extends keyof Dependencies>(
		name: T,
		dependency: Dependencies[T]
	): Dependencies[T] {
		if (this.dependencies.get(name)) {
			throw new FLError(
				'Dependency exists. Use this.update() function',
				'CONTAINER_DEP_EXISTS'
			);
		}

		this.dependencies.set(name, dependency);
		return dependency;
	}

	update<T extends keyof Dependencies>(
		name: T,
		dependency: Dependencies[T]
	): Dependencies[T] {
		if (!this.dependencies.has(name)) {
			throw new FLError(
				`Dependency '${name}' not found in container.`,
				'CONTAINER_DEP_NOT_FOUND'
			);
		}

		this.dependencies.set(name, dependency);
		return dependency;
	}

	resolve<T extends keyof Dependencies>(name: T): Dependencies[T] {
		if (!this.dependencies.has(name)) {
			throw new FLError(
				`Dependency '${name}' not found in container.`,
				'CONTAINER_DEP_NOT_FOUND'
			);
		}
		return this.dependencies.get(name) as Dependencies[T];
	}
}
export default DependencyContainer;
