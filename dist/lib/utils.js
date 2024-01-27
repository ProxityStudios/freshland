"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installEPAForJS = exports.installEPAForTS = exports.installDeps = exports.PackageManager = exports.updatePackageJSON = exports.deleteAndInitGit = exports.cloneGithubRepo = void 0;
const shelljs_1 = __importDefault(require("shelljs"));
const promises_1 = __importDefault(require("node:fs/promises"));
const logger_1 = require("./logger");
const dir_1 = require("../dir");
function cloneGithubRepo(repo, destination) {
    if (!shelljs_1.default.which('git')) {
        logger_1.logger.error('Sorry, this script requires "git"');
        shelljs_1.default.exit(1);
    }
    let repoURI = `https://github.com/${repo}`;
    if (repo.startsWith('http') || repo.startsWith('git@')) {
        repoURI = repo;
    }
    logger_1.logger.info('Cloning into', destination);
    if (shelljs_1.default.exec(`git clone ${repoURI} ${destination}`).code !== 0) {
        logger_1.logger.error('Cannot clone the repo');
        shelljs_1.default.exit(1);
    }
    logger_1.logger.info('Repo cloned');
}
exports.cloneGithubRepo = cloneGithubRepo;
function deleteAndInitGit(pth) {
    shelljs_1.default.cd(pth);
    if (shelljs_1.default.rm('-rf', '.git/').code !== 0) {
        logger_1.logger.error('Cannot delete ".git" folder');
        shelljs_1.default.exit(1);
    }
    logger_1.logger.info('Initializing git');
    if (shelljs_1.default.exec('git init').code !== 0) {
        logger_1.logger.error('"git init" command failed');
        shelljs_1.default.exit(1);
    }
    if (shelljs_1.default.exec('git add .').code !== 0) {
        logger_1.logger.error('"git add" command failed');
        shelljs_1.default.exit(1);
    }
    if (shelljs_1.default.exec(`git commit -am "Auto-commit by Freshland"`).code !== 0) {
        logger_1.logger.error('"git commit" command failed');
        shelljs_1.default.exit(1);
    }
    logger_1.logger.info('Git initialized');
}
exports.deleteAndInitGit = deleteAndInitGit;
function updatePackageJSON(projectName, pth) {
    shelljs_1.default.cd(pth);
    if (shelljs_1.default.test('-e', './package.json')) {
        logger_1.logger.info('Updating "package.json"');
        shelljs_1.default.ls('package.json').forEach((file) => {
            shelljs_1.default.sed('-i', /"name":\s*"(.*?)"/gi, `"name": "${projectName}"`, file);
            shelljs_1.default.sed('-i', /"version":\s*"(.*?)"/gi, `"version": "1.0.0"`, file);
        });
    }
    if (shelljs_1.default.test('-e', './package-lock.json')) {
        logger_1.logger.info('Updating "package-lock.json"');
        shelljs_1.default.ls('package-lock.json').forEach((file) => {
            shelljs_1.default.sed('-i', /"name":\s*"(.*?)"/i, `"name": "${projectName}"`, file);
            shelljs_1.default.sed('-i', /"version":\s*"(.*?)"/i, `"version": "1.0.0"`, file);
        });
    }
}
exports.updatePackageJSON = updatePackageJSON;
var PackageManager;
(function (PackageManager) {
    PackageManager["npm"] = "npm";
    PackageManager["pnpm"] = "pnpm";
    PackageManager["yarn"] = "yarn";
    PackageManager["bun"] = "bun";
})(PackageManager || (exports.PackageManager = PackageManager = {}));
function installDeps(packageManager, projectName, pth) {
    shelljs_1.default.cd(pth);
    // TODO: pick the package manager automaticly (support npm, pnpm, yarn & bun)
    if (packageManager === PackageManager.npm) {
        updatePackageJSON(projectName, pth);
        if (!shelljs_1.default.which('npm')) {
            logger_1.logger.error('Sorry, you need to install "npm" first');
            return;
        }
        logger_1.logger.info('Installing dependencies...');
        if (shelljs_1.default.exec('npm install').code === 0) {
            logger_1.logger.info('Dependencies installed');
        }
        else {
            logger_1.logger.error('"npm install" command failed');
            logger_1.logger.warn('You need to install dependencies manually!');
        }
    }
    // TODO: support other package managers
}
exports.installDeps = installDeps;
async function installEPAForTS(pth) {
    logger_1.logger.info('Installing EPA (for TypeScript)');
    const directoryExists = await checkIfDirectoryExists(pth);
    if (directoryExists) {
        shelljs_1.default.cd(pth);
    }
    else {
        logger_1.logger.error('Directory not exists. Exiting...');
        shelljs_1.default.exit(1);
    }
    // TODO: check if package.json or the package managers configs exists or not
    logger_1.logger.info('Adding packages');
    shelljs_1.default.exec('npm install --no-save-dev eslint eslint-config-prettier @typescript-eslint/eslint-plugin prettier eslint-config-prettier');
    shelljs_1.default.exec('npm install --no-save eslint-config-airbnb-typescript @typescript-eslint/eslint-plugin@^6.0.0 @typescript-eslint/parser@^6.0.0 --save-dev');
    shelljs_1.default.exec('npx install-peerdeps --dev eslint-config-airbnb-base', {});
    shelljs_1.default.exec('npm i --save', {});
    logger_1.logger.info('Packages installed');
    logger_1.logger.info('Creating .eslintrc.js file');
    const eslintRcTemplate = await promises_1.default.readFile(`${dir_1.rootDir}/templates/typescript/.eslintrc.js`, 'utf8');
    await promises_1.default.writeFile('.eslintrc.js', eslintRcTemplate);
    logger_1.logger.info('Creating prettier.config.js file');
    const prettierRcTemplate = await promises_1.default.readFile(`${dir_1.rootDir}/templates/typescript/prettier.config.js`, 'utf8');
    await promises_1.default.writeFile('prettier.config.js', prettierRcTemplate);
    logger_1.logger.info('Pushing "fix" script to package.json');
    const packagePath = `${process.cwd()}/package.json`;
    const packageContent = await promises_1.default.readFile(packagePath, 'utf8');
    const packageJSON = JSON.parse(packageContent);
    packageJSON.scripts = {
        ...packageJSON.scripts,
        fix: 'eslint . --fix',
    };
    await promises_1.default.writeFile(packagePath, JSON.stringify(packageJSON, undefined, 2), 'utf8');
    logger_1.logger.warn('[IMPORTANT] To get better experience, install "eslint" and "prettier" extensions');
    logger_1.logger.info('E.P.A installed and configured successfully');
}
exports.installEPAForTS = installEPAForTS;
function installEPAForJS() {
    logger_1.logger.info('Installing EPA (for JavaScript)');
}
exports.installEPAForJS = installEPAForJS;
async function checkIfDirectoryExists(directoryPath) {
    try {
        const stats = await promises_1.default.stat(directoryPath);
        return stats.isDirectory();
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
        // TODO:
        return false;
    }
}
