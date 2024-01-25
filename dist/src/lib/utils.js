"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePackageJSON = exports.deleteAndInitGit = exports.cloneGithubRepo = void 0;
const axios_1 = __importDefault(require("axios"));
const node_path_1 = __importDefault(require("node:path"));
const shelljs_1 = __importDefault(require("shelljs"));
const logger_1 = require("./logger");
async function cloneGithubRepo(repo, destination) {
    if (!shelljs_1.default.which('git')) {
        logger_1.logger.error('Sorry, this script requires "git"');
        shelljs_1.default.exit(1);
    }
    const repoURI = `https://github.com/${repo}`;
    const pathToClone = node_path_1.default.resolve(destination);
    try {
        await axios_1.default.get(`https://api.github.com/repos/${repo}`);
    }
    catch {
        logger_1.logger.error('Repo is not available or an unexpected error has occurred. Please try again...');
        shelljs_1.default.exit(1);
    }
    logger_1.logger.info('Cloning to', pathToClone);
    if (shelljs_1.default.exec(`git clone ${repoURI} ${pathToClone}`).code !== 0) {
        logger_1.logger.error('Cannot clone the repo');
        shelljs_1.default.exit(1);
    }
    logger_1.logger.info('Repo cloned');
    deleteAndInitGit(pathToClone);
    updatePackageJSON(destination.replaceAll('/', '-'), pathToClone);
    // TODO: install deps automaticly (support npm, pnpm & yarn)
    // TODO: open vscode when its done
    logger_1.logger.warn('IMPORTANT - You need to install dependencies - IMPORTANT');
    logger_1.logger.info('Done, you are ready to go!');
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
