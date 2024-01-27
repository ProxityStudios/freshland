"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installEPAForJS = exports.installEPAForTS = exports.installDeps = exports.PackageManager = exports.updatePackageJSON = exports.deleteAndInitGit = exports.cloneGithubRepo = void 0;
const shelljs_1 = __importDefault(require("shelljs"));
const promises_1 = __importDefault(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const logger_1 = require("./logger");
// Assuming this script is in the root directory of your project
const rootDir = path.resolve(process.cwd());
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
    deleteAndInitGit(destination);
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
    shelljs_1.default.cd(pth);
    logger_1.logger.info('Installing dependencies');
    shelljs_1.default.exec('npm install', { async: true });
    logger_1.logger.info('Dependencies installed');
    logger_1.logger.info('Installing packages');
    shelljs_1.default.exec('npm install --save-dev eslint eslint-config-prettier @typescript-eslint/eslint-plugin prettier eslint-config-prettier', { async: true });
    shelljs_1.default.exec('npx install-peerdeps --dev eslint-config-airbnb-base', {
        async: true,
    });
    shelljs_1.default.exec('npm install eslint-config-airbnb-typescript @typescript-eslint/eslint-plugin@^6.0.0 @typescript-eslint/parser@^6.0.0 --save-dev');
    logger_1.logger.info('Packages installed');
    const eslintRcTemplate = await promises_1.default.readFile(`${rootDir}/templates/typescript/.eslintrc.js`, 'utf8');
    await promises_1.default.writeFile('.eslintrc.js', eslintRcTemplate);
    const prettierRcTemplate = await promises_1.default.readFile(`${rootDir}/templates/typescript/prettier.config.js`, 'utf8');
    await promises_1.default.writeFile('prettier.config.js', prettierRcTemplate);
    const packagePath = `${process.cwd()}/package.json`;
    const packageContent = await promises_1.default.readFile(packagePath, 'utf8');
    const packageJSON = JSON.parse(packageContent);
    packageJSON.scripts = {
        ...packageJSON.scripts,
        fix: 'eslint . --fix',
    };
    await promises_1.default.writeFile(packagePath, JSON.stringify(packageJSON, undefined, 2), 'utf8');
    logger_1.logger.info('EPA installed successfully');
}
exports.installEPAForTS = installEPAForTS;
function installEPAForJS() {
    logger_1.logger.info('Installing EPA (for JavaScript)');
}
exports.installEPAForJS = installEPAForJS;
