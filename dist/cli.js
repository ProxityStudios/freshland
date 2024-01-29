#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalOptions = exports.program = void 0;
const prompts_1 = require("@inquirer/prompts");
const extra_typings_1 = require("@commander-js/extra-typings");
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("./lib/logger");
const utils_1 = require("./lib/utils");
const package_json_1 = require("../package.json");
const types_1 = require("./types");
exports.program = new extra_typings_1.Command()
    .name(package_json_1.name)
    .version(package_json_1.version, '-v, --vers', 'Output the current version')
    .description(package_json_1.description)
    .option('-d, --debug', 'Enable debug mode')
    .action(GUIcloneCommand);
exports.program
    .command('clone')
    .description('Clone a repo to specified path')
    .argument('<repo>', 'proxitystudios/typescript-starter / https://github.com/proxitystudios/typescript-starter')
    .argument('<path>', 'path/to/clone')
    .option('--upd, --update-package', 'Update package name and version')
    .option('--n, --name <name>', 'Change the package name')
    .option('--v, --version <version>', 'Change the package version')
    .option('--i, --install-deps <packageManager>', 'Install dependencies automatically (supports npm, yarn, pnpm & bun)')
    .option('--kg, --keep-git', 'Do not delete ".git" folder')
    .action(NOGUIcloneCommand);
exports.program
    .command('init-epa')
    .description('[BETA] Installs Eslint, Prettier & Airbnb and automatically configures it.')
    .argument('<path>', 'path/to/install')
    .option('--ts, --typescript', 'Use typpescript')
    .action(initEPACommand);
exports.globalOptions = exports.program.opts();
if (exports.globalOptions.debug) {
    logger_1.logger.debug('Debug mode enabled');
}
exports.program.parse(process.argv);
async function initEPACommand(pth, opts) {
    const { typescript } = opts;
    const p = node_path_1.default.resolve(pth);
    await (typescript ? (0, utils_1.initEPAForTS)(p) : (0, utils_1.initEPAForJS)(p));
}
function NOGUIcloneCommand(repo, destination, opts) {
    const pth = node_path_1.default.resolve(destination);
    const { keepGit, name: packageName, version: packageVersion, installDeps: iDeps, updatePackage, } = opts;
    try {
        (0, utils_1.cloneGithubRepo)(repo, pth);
        if (keepGit) {
            logger_1.logger.warn('Git deletion skipped. (remove --kg or --keep-git flag to delete)');
        }
        else {
            (0, utils_1.deleteAndInitGit)(pth);
        }
        if (updatePackage || packageName || packageVersion) {
            (0, utils_1.updatePackageJSON)(packageName
                ? packageName.replaceAll(' ', '-')
                : destination.split('/').pop(), packageVersion ?? '1.0.0', pth);
        }
        if (iDeps) {
            (0, utils_1.installDeps)(iDeps, pth);
        }
        else {
            logger_1.logger.warn('You need to install dependencies manually!');
        }
        logger_1.logger.info('Done, you are ready to code!');
    }
    catch {
        logger_1.logger.error('An unexpected error occured or user canceled the process.');
    }
}
async function GUIcloneCommand() {
    let repo;
    try {
        const usingStarter = await (0, prompts_1.confirm)({
            message: 'Do you want to use a starter?',
            default: false,
        });
        repo = await (usingStarter
            ? (0, prompts_1.select)({
                message: 'Select a starter',
                choices: [
                    {
                        name: 'typescript-starter',
                        value: 'proxitystudios/typescript-starter',
                        description: 'Use TypeScript Starter that includes E.P.A',
                    },
                    {
                        name: 'express-api-starter-ts',
                        value: 'proxitystudios/express-api-starter-ts',
                        description: 'Use Express API Starter written with TypeScript that includes E.P.A',
                    },
                    {
                        name: 'discord-bot-starter-ts',
                        value: 'proxitystudios/discord-bot-starter-ts',
                        description: 'Use Discord Bot Starter written with TypeScript that includes E.P.A',
                    },
                ],
            })
            : (0, prompts_1.input)({
                message: 'What repo do you want to clone?',
                validate: (i) => {
                    if (i.trim() === '') {
                        return 'Repo cannot be empty.';
                    }
                    return true;
                },
            }));
        const destination = await (0, prompts_1.input)({
            message: 'Where do you want to clone?',
            validate: (i) => {
                if (i.trim() === '') {
                    return 'Path cannot be empty.';
                }
                return true;
            },
        });
        const pth = node_path_1.default.resolve(destination);
        const updatePackageNameAndVersion = await (0, prompts_1.confirm)({
            message: 'Do you want to change the package name and version?',
            default: false,
        });
        let packageName;
        let packageVersion;
        if (updatePackageNameAndVersion) {
            packageName = await (0, prompts_1.input)({
                message: 'What should we call this repo?',
                default: destination === '.'
                    ? pth.split(/[/\\]/).pop()
                    : destination.replaceAll(' ', '-').split(/[/\\]/).pop(),
                transformer: (v) => {
                    return v.replaceAll(' ', '-');
                },
            });
            packageVersion = await (0, prompts_1.input)({
                message: 'What version should we use?',
                default: '1.0.0',
                validate: (i) => {
                    if (!/^[\d.]*$/.test(i)) {
                        return 'Version should include only numbers and dots. (1.0.0)';
                    }
                    if (i.split('.').length < 2) {
                        return 'Version should include at least a dot. (1.0)';
                    }
                    return true;
                },
            });
        }
        const installDependencies = await (0, prompts_1.confirm)({
            message: 'Do you want to install dependencies?',
            default: false,
        });
        let initEPA;
        if (!usingStarter) {
            initEPA = await (0, prompts_1.confirm)({
                message: 'Do you want to init E.P.A and automatically configure it?',
                default: false,
            });
        }
        let repoCodeLanguage;
        if (initEPA) {
            repoCodeLanguage = await (0, prompts_1.select)({
                message: 'Select the code language of the repo',
                choices: [
                    {
                        name: 'This repo uses JavaScript',
                        value: 'javascript',
                        disabled: true,
                    },
                    {
                        name: 'This repo uses TypeScript',
                        value: 'javascript',
                    },
                ],
            });
        }
        let selectedPackageManager;
        if (installDependencies) {
            selectedPackageManager = await (0, prompts_1.select)({
                message: 'Select the package manager of the repo',
                choices: [
                    {
                        name: 'Use "npm" package manager',
                        value: types_1.PackageManagerEnum.npm,
                        description: `Install dependencies using ${types_1.PackageManagerEnum.npm}`,
                    },
                    {
                        name: types_1.PackageManagerEnum.bun,
                        value: types_1.PackageManagerEnum.bun,
                        description: `Install dependencies using ${types_1.PackageManagerEnum.bun}`,
                    },
                    {
                        name: types_1.PackageManagerEnum.pnpm,
                        value: types_1.PackageManagerEnum.pnpm,
                        description: `Install dependencies using ${types_1.PackageManagerEnum.pnpm}`,
                    },
                    {
                        name: types_1.PackageManagerEnum.yarn,
                        value: types_1.PackageManagerEnum.yarn,
                        description: `Install dependencies using ${types_1.PackageManagerEnum.yarn}`,
                    },
                ],
            });
        }
        (0, utils_1.cloneGithubRepo)(repo, pth);
        (0, utils_1.deleteAndInitGit)(destination);
        if (updatePackageNameAndVersion) {
            (0, utils_1.updatePackageJSON)(packageName, packageVersion, pth);
        }
        if (initEPA) {
            if (repoCodeLanguage === 'javascript') {
                await (0, utils_1.initEPAForJS)(pth);
            }
            if (repoCodeLanguage === 'typescript') {
                await (0, utils_1.initEPAForTS)(pth);
            }
        }
        else if (selectedPackageManager) {
            (0, utils_1.installDeps)(selectedPackageManager, pth);
        }
        else {
            logger_1.logger.warn('You need to install dependencies manually!');
        }
        logger_1.logger.info('Done, you are ready to code!');
    }
    catch {
        logger_1.logger.error('An unexpected error occured or user canceled the process.');
    }
}
