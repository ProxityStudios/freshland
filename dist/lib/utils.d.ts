export declare function cloneGithubRepo(repo: string, destination: string): void;
export declare function deleteAndInitGit(pth: string): void;
export declare function updatePackageJSON(projectName: string, pth: string): void;
export declare enum PackageManager {
    npm = "npm",
    pnpm = "pnpm",
    yarn = "yarn",
    bun = "bun"
}
type PackageManagerKeys = keyof typeof PackageManager;
export declare function installDeps(packageManager: PackageManagerKeys, projectName: string, pth: string): void;
export declare function installEPAForTS(pth: string): Promise<void>;
export declare function installEPAForJS(): void;
export {};
//# sourceMappingURL=utils.d.ts.map