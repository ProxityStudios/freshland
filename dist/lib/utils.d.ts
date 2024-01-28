import { PackageManager } from '../types';
export declare function cloneGithubRepo(repo: string, destination: string): void;
export declare function deleteAndInitGit(pth: string): void;
export declare function updatePackageJSON(projectName: string, pth: string): void;
export declare function installDeps(packageManager: PackageManager, projectName: string, pth: string): void;
export declare function installEPAForTS(pth: string): Promise<void>;
export declare function installEPAForJS(): void;
//# sourceMappingURL=utils.d.ts.map