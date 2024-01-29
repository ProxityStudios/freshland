"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEPAForJS = exports.initEPAForTS = exports.installDeps = exports.updatePackageJSON = exports.deleteAndInitGit = exports.cloneGithubRepo = void 0;
const shelljs_1 = __importDefault(require("shelljs"));
const promises_1 = __importDefault(require("node:fs/promises"));
const logger_1 = require("./logger");
const dir_1 = require("./dir");
const types_1 = require("../types");
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
    if (shelljs_1.default.exec('git commit -am "Auto-commit by Freshland"').code !== 0) {
        logger_1.logger.error('"git commit" command failed');
        shelljs_1.default.exit(1);
    }
    logger_1.logger.info('Git initialized');
}
exports.deleteAndInitGit = deleteAndInitGit;
function updatePackageJSON(packageName, packageVersion, pth) {
    shelljs_1.default.cd(pth);
    if (shelljs_1.default.test('-e', './package.json')) {
        logger_1.logger.info('Updating "package.json"');
        shelljs_1.default.ls('package.json').forEach((file) => {
            shelljs_1.default.sed('-i', /"name":\s*"(.*?)"/gi, `"name": "${packageName}"`, file);
            shelljs_1.default.sed('-i', /"version":\s*"(.*?)"/gi, `"version": "${packageVersion}"`, file);
        });
    }
    else {
        logger_1.logger.warn('File not found: package.json');
    }
    if (shelljs_1.default.test('-e', './package-lock.json')) {
        logger_1.logger.info('Updating "package-lock.json"');
        shelljs_1.default.ls('package-lock.json').forEach((file) => {
            shelljs_1.default.sed('-i', /"name":\s*"(.*?)"/i, `"name": "${packageName}"`, file);
            shelljs_1.default.sed('-i', /"version":\s*"(.*?)"/i, `"version": "${packageVersion}"`, file);
        });
    }
    else {
        logger_1.logger.warn('File not found: package-lock.json');
    }
}
exports.updatePackageJSON = updatePackageJSON;
function installDeps(packageManager, pth) {
    shelljs_1.default.cd(pth);
    switch (packageManager) {
        case types_1.PackageManagerEnum.npm: {
            if (!shelljs_1.default.which('npm')) {
                logger_1.logger.error('Sorry, you need to install "npm" to install dependencies');
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
            break;
        }
        case types_1.PackageManagerEnum.yarn: {
            if (!shelljs_1.default.which('yarn')) {
                logger_1.logger.error('Sorry, you need to install "yarn" to install dependencies');
                return;
            }
            logger_1.logger.info('Installing dependencies...');
            if (shelljs_1.default.exec('yarn install').code === 0) {
                logger_1.logger.info('Dependencies installed');
            }
            else {
                logger_1.logger.error('"yarn install" command failed');
                logger_1.logger.warn('You need to install dependencies manually!');
            }
            break;
        }
        case types_1.PackageManagerEnum.pnpm: {
            if (!shelljs_1.default.which('pnpm')) {
                logger_1.logger.error('Sorry, you need to install "pnpm" to install dependencies');
                return;
            }
            logger_1.logger.info('Installing dependencies...');
            if (shelljs_1.default.exec('pnpm install').code === 0) {
                logger_1.logger.info('Dependencies installed');
            }
            else {
                logger_1.logger.error('"pnpm install" command failed');
                logger_1.logger.warn('You need to install dependencies manually!');
            }
            break;
        }
        case types_1.PackageManagerEnum.bun: {
            if (!shelljs_1.default.which('bun')) {
                logger_1.logger.error('Sorry, you need to install "bun" to install dependencies');
                return;
            }
            logger_1.logger.info('Installing dependencies...');
            if (shelljs_1.default.exec('bun install').code === 0) {
                logger_1.logger.info('Dependencies installed');
            }
            else {
                logger_1.logger.error('"bun install" command failed');
                logger_1.logger.warn('You need to install dependencies manually!');
            }
            break;
        }
        default: {
            logger_1.logger.error('Invalid package manager');
            logger_1.logger.error('You need to install dependencies manually!');
            break;
        }
    }
}
exports.installDeps = installDeps;
async function initEPAForTS(pth) {
    const directoryExists = await checkIfExists(pth, types_1.Check.DIRECTORY);
    const packageJSONExists = await checkIfExists(`${pth}/package.json`, types_1.Check.FILE);
    if (directoryExists && packageJSONExists) {
        shelljs_1.default.cd(pth);
    }
    else {
        logger_1.logger.error('Directory or "package.json" not exists. Exiting...');
        shelljs_1.default.exit(1);
    }
    logger_1.logger.info('Installing E.P.A (for TypeScript)');
    logger_1.logger.info('Installing packages...');
    shelljs_1.default.exec('npm install -D eslint eslint-config-prettier eslint-config-airbnb-base eslint-plugin-prettier eslint-plugin-import @typescript-eslint/eslint-plugin prettier eslint-config-airbnb-typescript @typescript-eslint/parser');
    shelljs_1.default.exec('npm i --save');
    logger_1.logger.info('Packages installed');
    logger_1.logger.info('Creating .eslintrc.js file');
    const eslintRcTemplate = await promises_1.default.readFile(`${dir_1.rootDir}/templates/typescript/.eslintrc.js`, 'utf8');
    await promises_1.default.writeFile('.eslintrc.js', eslintRcTemplate);
    logger_1.logger.info('Creating prettier.config.js file');
    const prettierRcTemplate = await promises_1.default.readFile(`${dir_1.rootDir}/templates/typescript/prettier.config.js`, 'utf8');
    await promises_1.default.writeFile('prettier.config.js', prettierRcTemplate);
    const eslintIgnoreTemplate = await promises_1.default.readFile(`${dir_1.rootDir}/templates/typescript/.eslintignore`, 'utf8');
    await promises_1.default.writeFile('.eslintignore', eslintIgnoreTemplate);
    logger_1.logger.info('Pushing "fix" script to package.json');
    const packageContent = await promises_1.default.readFile('package.json', 'utf8');
    const packageJSON = JSON.parse(packageContent);
    packageJSON.scripts = {
        ...packageJSON.scripts,
        fix: 'eslint . --fix',
    };
    await promises_1.default.writeFile('package.json', JSON.stringify(packageJSON, undefined, 2), 'utf8');
    logger_1.logger.warn('[IMPORTANT] To get better experience, install "eslint" and "prettier" extensions');
    logger_1.logger.info('E.P.A installed and configured successfully');
    logger_1.logger.info('Now you can run "npm run fix" command');
}
exports.initEPAForTS = initEPAForTS;
async function initEPAForJS(pth) {
    logger_1.logger.info('Installing E.P.A (for JavaScript)');
}
exports.initEPAForJS = initEPAForJS;
async function checkIfExists(pth, type) {
    try {
        const stats = await promises_1.default.stat(pth);
        switch (type) {
            case types_1.Check.DIRECTORY: {
                return stats.isDirectory();
            }
            case types_1.Check.FILE: {
                return stats.isFile();
            }
            default: {
                return false;
            }
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
        return false;
    }
}
