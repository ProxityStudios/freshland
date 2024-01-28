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
    .version(package_json_1.version)
    .description(package_json_1.description)
    .option('-d, --debug', 'Enable debug mode')
    // default command
    .action(GUIcloneCommand);
exports.program
    .command('clone')
    // TODO: implement this
    // .option('-lr, --latest-release', 'Use latest release')
    .description('Clone the repo to specified path as much as fresh')
    .argument('<repo>', 'EG: proxitystudios/typescript-starter OR https://github.com/proxitystudios/typescript-starter')
    .argument('<path>', 'EG: path/to/clone')
    .action(NOGUIcloneCommand);
exports.program
    .command('init-epa')
    .description('[BETA] Installs "eslint", "prettier", "airbnb" and configures it automaticlly.')
    .argument('<path>', 'path/to/install')
    .option('--ts, --typescript', 'Use typpescript')
    .action(initEPACommand);
exports.globalOptions = exports.program.opts();
if (exports.globalOptions.debug) {
    logger_1.logger.debug('Debug mode enabled');
}
// Parse the command-line arguments
exports.program.parse(process.argv);
async function initEPACommand(pth, opts) {
    const { typescript } = opts;
    const p = node_path_1.default.resolve(pth);
    await (typescript ? (0, utils_1.initEPAForTS)(p) : (0, utils_1.initEPAForJS)(p));
}
function NOGUIcloneCommand(repo, destination) {
    // options.debug
    const pth = node_path_1.default.resolve(destination);
    try {
        (0, utils_1.cloneGithubRepo)(repo, pth);
        (0, utils_1.deleteAndInitGit)(pth);
        // FIXME: it uses default package manager (npm)
        (0, utils_1.updatePackageJSON)(destination.split('/').pop(), '1.0.0', pth);
        logger_1.logger.warn('You need to install dependencies manually!');
        logger_1.logger.info('Done, you are ready to code!');
    }
    catch {
        logger_1.logger.error('An unexpected error occured or user canceled the process.');
    }
}
async function GUIcloneCommand() {
    // options.debug
    let repo;
    try {
        const usingTemplate = await (0, prompts_1.confirm)({
            message: 'Do you want to use a starter?',
            default: false,
        });
        repo = await (usingTemplate
            ? (0, prompts_1.select)({
                message: 'Select a starter',
                choices: [
                    {
                        name: 'typescript-starter',
                        value: 'proxitystudios/typescript-starter',
                        description: 'typescript-starter',
                    },
                    {
                        name: 'express-api-starter-ts',
                        value: 'proxitystudios/express-api-starter-ts',
                        description: 'express-api-starter-ts',
                    },
                    {
                        name: 'discord-bot-starter-ts',
                        value: 'proxitystudios/discord-bot-starter-ts',
                        description: 'discord-bot-starter-ts',
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
                default: destination.split('/').pop(),
                validate: (i) => {
                    i.replaceAll(' ', '-');
                    return true;
                },
            });
            packageVersion = await (0, prompts_1.input)({
                message: 'What version should we use?',
                default: '1.0.0',
                validate: (i) => {
                    if (i.trim() === '') {
                        return 'Version cannot be empty.';
                    }
                    if (!/^[\d.]*$/.test(i)) {
                        return 'Version should include only numbers and dots. (1.0.0)';
                    }
                    return true;
                },
            });
        }
        const installDependencies = await (0, prompts_1.confirm)({
            message: 'Do you want to install dependencies?',
            default: true,
        });
        /*
        const installEPA = await confirm({
            message:
                'Do you want to install "eslint", "prettier" & "airbnb" and configure automaticlly?',
            default: true,
        });
        */
        let selectedPackageManager;
        if (installDependencies) {
            selectedPackageManager = await (0, prompts_1.select)({
                message: 'Select the package manager of the repo',
                choices: [
                    {
                        name: types_1.PackageManager.NPM,
                        value: types_1.PackageManager.NPM,
                        description: `Install dependencies using ${types_1.PackageManager.NPM}`,
                    },
                    {
                        name: types_1.PackageManager.BUN,
                        value: types_1.PackageManager.BUN,
                        description: `Install dependencies using ${types_1.PackageManager.BUN}`,
                    },
                    {
                        name: types_1.PackageManager.PNPM,
                        value: types_1.PackageManager.PNPM,
                        description: `Install dependencies using ${types_1.PackageManager.PNPM}`,
                    },
                    {
                        name: types_1.PackageManager.YARN,
                        value: types_1.PackageManager.YARN,
                        description: `Install dependencies using ${types_1.PackageManager.YARN}`,
                    },
                ],
            });
        }
        (0, utils_1.cloneGithubRepo)(repo, pth);
        (0, utils_1.deleteAndInitGit)(destination);
        if (updatePackageNameAndVersion) {
            (0, utils_1.updatePackageJSON)(packageName, packageVersion, pth);
        }
        if (selectedPackageManager) {
            (0, utils_1.installDeps)(selectedPackageManager, pth);
        }
        else {
            logger_1.logger.warn('You need to install dependencies manually!');
        }
        logger_1.logger.info('Done, you are ready to code!');
        // TODO: open vscode when its done
    }
    catch {
        logger_1.logger.error('An unexpected error occured or user canceled the process.');
    }
}
