#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const prompts_1 = require("@inquirer/prompts");
const extra_typings_1 = require("@commander-js/extra-typings");
const logger_1 = require("./lib/logger");
const utils_1 = require("./lib/utils");
const package_json_1 = require("../package.json");
exports.program = new extra_typings_1.Command()
    .name(package_json_1.name)
    .version(package_json_1.version)
    .description(package_json_1.description)
    .option('-d, --debug', 'Enable debug mode')
    // default
    .action(GUIcloneCommand);
exports.program
    .command('clone')
    .description('Clone the repo to specified path as much as fresh')
    .argument('<repo>', 'EG: proxitystudios/typescript-starter OR https://github.com/proxitystudios/typescript-starter')
    .argument('<path>', "EG: path/to/clone'")
    .action(NOGUIcloneCommand);
// Parse the command-line arguments
exports.program.parse(process.argv);
const options = exports.program.opts();
async function NOGUIcloneCommand(repo, path) {
    // options.debug
    try {
        await (0, utils_1.cloneGithubRepo)(repo, path);
    }
    catch {
        logger_1.mainLogger.error('An unexpected error occured');
    }
}
async function GUIcloneCommand() {
    // options.debug
    try {
        const repo = await (0, prompts_1.input)({
            message: 'What repo do you want to clone?',
            validate: (i) => {
                if (i.trim() === '') {
                    return 'Repo name cannot be empty.';
                }
                return true;
            },
        });
        const path = await (0, prompts_1.input)({
            message: 'Where do you want to clone?',
            validate: (i) => {
                if (i.trim() === '') {
                    return 'Path cannot be empty.';
                }
                return true;
            },
        });
        await (0, utils_1.cloneGithubRepo)(repo, path);
    }
    catch {
        logger_1.mainLogger.error('An unexpected error occured');
    }
}
