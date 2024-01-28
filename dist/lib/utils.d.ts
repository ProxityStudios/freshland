import { PackageManager } from '../types';
export declare function cloneGithubRepo(repo: string, destination: string): void;
export declare function deleteAndInitGit(pth: string): void;
export declare function updatePackageJSON(packageName: string, packageVersion: string, pth: string): void;
export declare function installDeps(packageManager: PackageManager, pth: string): void;
export declare function initEPAForTS(pth: string): Promise<void>;
export declare function initEPAForJS(pth: string): void;
//# sourceMappingURL=utils.d.ts.map