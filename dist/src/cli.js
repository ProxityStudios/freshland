#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.program = void 0;
const prompts_1 = require("@inquirer/prompts");
const extra_typings_1 = require("@commander-js/extra-typings");
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("./lib/logger");
const utils_1 = require("./lib/utils");
const package_json_1 = require("../package.json");
exports.program = new extra_typings_1.Command()
    .name(package_json_1.name)
    .version(package_json_1.version)
    .description(package_json_1.description)
    .option('-d, --debug', 'Enable debug mode')
    // default command
    .action(GUIcloneCommand);
exports.options = exports.program.opts();
if (exports.options.debug) {
    logger_1.logger.debug('Debug mode enabled');
}
exports.program
    .command('clone')
    // .option('-lr, --latest-release', 'Use latest release')
    .description('Clone the repo to specified path as much as fresh')
    .argument('<repo>', 'EG: proxitystudios/typescript-starter OR https://github.com/proxitystudios/typescript-starter')
    .argument('<path>', "EG: path/to/clone'")
    .action(NOGUIcloneCommand);
// Parse the command-line arguments
exports.program.parse(process.argv);
function NOGUIcloneCommand(repo, destination) {
    // options.debug
    const pth = node_path_1.default.resolve(destination);
    try {
        (0, utils_1.cloneGithubRepo)(repo, pth);
        // FIXME: it uses default package manager (npm)
        (0, utils_1.updatePackageJSON)(destination.split('/').pop(), pth);
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
        const projectName = await (0, prompts_1.input)({
            message: 'What should we call this repo?',
            validate: (i) => {
                if (i.trim() === '') {
                    return 'Repo name cannot be empty.';
                }
                return true;
            },
        });
        const installDependencies = await (0, prompts_1.confirm)({
            message: 'Do you want to install dependencies?',
            default: true,
        });
        let selectedPackageManager;
        if (installDependencies) {
            selectedPackageManager = await (0, prompts_1.select)({
                message: 'Select the package manager of the repo',
                choices: [
                    {
                        name: utils_1.PackageManager.npm,
                        value: utils_1.PackageManager.npm,
                        description: utils_1.PackageManager.npm,
                    },
                    {
                        name: utils_1.PackageManager.bun,
                        value: utils_1.PackageManager.bun,
                        description: `${utils_1.PackageManager.bun} (currently not supported)`,
                        disabled: true,
                    },
                    {
                        name: utils_1.PackageManager.pnpm,
                        value: utils_1.PackageManager.pnpm,
                        description: `${utils_1.PackageManager.pnpm} (currently not supported)`,
                        disabled: true,
                    },
                    {
                        name: utils_1.PackageManager.yarn,
                        value: utils_1.PackageManager.yarn,
                        description: `${utils_1.PackageManager.yarn} (currently not supported)`,
                        disabled: true,
                    },
                ],
            });
        }
        const pth = node_path_1.default.resolve(destination);
        (0, utils_1.cloneGithubRepo)(repo, pth);
        if (selectedPackageManager) {
            (0, utils_1.installDeps)(selectedPackageManager, projectName.replaceAll(' ', '-'), pth);
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
