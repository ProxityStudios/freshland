import { PackageManager } from '../types';
export declare function cloneGithubRepo(repo: string, destination: string): void;
export declare function deleteAndInitGit(pth: string): void;
export declare function updatePackageJSON(projectName: string, pth: string): void;
export declare function installDeps(packageManager: PackageManager, projectName: string, pth: string): void;
export declare function initEPAForTS(pth: string): Promise<void>;
export declare function initEPAForJS(): void;
//# sourceMappingURL=utils.d.ts.map