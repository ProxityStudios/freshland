#!/usr/bin/env node

import { createCommand, Option } from '@commander-js/extra-typings';
import { prompt } from 'enquirer';

import { version, name, description } from '../../package.json';
import type { FreshlandMode } from '../root/types';
import Constants from '../root/constants';
import { Freshland } from '../freshland';
import { Builder } from '../freshland/utils/builder';
import { logger } from '../root/logger';

const freshland = new Freshland();
const builder = new Builder();

const program = createCommand()
  .name(name)
  .description(description)
  .version(version, '-v, --vers', 'Outputs the current version')
  .option('--verbose', 'Enables verbose mode')
  .option('--proxy <proxy>', 'Uses proxy')
  .option('--force', 'Enables force mode')
  .addOption(
    new Option('--mode <mode>', 'Changes the mode').choices<readonly FreshlandMode[]>(
      Array.from(Constants.SupportedModes)
    )
  )
  .action(async (options) => {
    try {
      const { confirmTemplate }: { confirmTemplate: boolean } = await prompt({
        type: 'confirm',
        name: 'confirmTemplate',
        message: 'Do you want to use a template?',
      });
  
      const { source }: { source: string } = await (confirmTemplate
        ? prompt({
          type: 'select',
          name: 'source',
          message: 'Choose a template',
          choices: [
            {
              message: 'Use TypeScript Starter',
              name: Constants.Templates.TypeScriptStarter,
            },
            {
              message: 'Use JavaScript Starter',
              name: Constants.Templates.JavaScriptStarter,
            },
            {
              message: 'Use Express API Starter (menu)',
              name: 'TODO: Implement MENU',
              disabled: true,
            },
            {
              message: 'Use Discord Bot Starter (menu)',
              name: 'TODO: Implement MENU',
              disabled: true,
            },
          ],
        })
        : prompt({
          type: 'input',
          name: 'source',
          message: 'What source do you want to clone?',
          validate: (sourceRepo) => {
            if (sourceRepo.trim() === '') {
              return 'This input cannot be empty.';
            }
  
            return true;
          },
        }));
  
      const { destination }: { destination: string } = await prompt({
        type: 'input',
        name: 'destination',
        message: 'Where do you want to clone?',
        validate: (i) => {
          if (i.trim() === '') {
            return 'This input cannot be empty.';
          }
          return true;
        },
      });
  
      if (!options.force) {
        const { force }: { force: boolean } = await prompt({
          type: 'confirm',
          name: 'force',
          message: 'Should I abort the cloning if the directory not empty?',
          initial: false,
        });
  
        builder.setForce(force);
      }
  
      if (confirmTemplate) {
        // todo:
        builder.useTemplate('typescript-starter'); // variable: source
      } else {
        builder.setSource(source);
      }
  
      builder.setDestination(destination);
  
      await freshland.clone(builder);
    } catch (error) {
      logger.error("An error occurred or user aborted.", error);
    }
  })

const globalOpts = program.opts();

if (globalOpts.mode) {
  builder.setMode(globalOpts.mode);
}

if (globalOpts.proxy) {
  builder.setProxy(globalOpts.proxy);
}

if (globalOpts.verbose) {
  freshland.setVerboseMode(globalOpts.verbose);
}

if (globalOpts.force) {
  builder.setForce(globalOpts.force);
}

program.command('clone')
  // TODO: implement this
  // .option('-lr, --latest-release', 'Use latest release')
  .description('Clones repository')
  .argument(
    '<repository>',
    '"ProxityStudios/typescript-starter" OR "https://github.com/proxitystudios/typescript-starter"'
  )
  .argument('<destination>', 'path/to/clone')
  // .option('--upd, --update-package', 'Update the package name and version')
  // .option(
  //   '--n, --name <name>',
  //   'Specify the package name | --upd flag required'
  // )
  // .option(
  //   '--v, --version <version>',
  //   'Specify the package version | --upd flag required'
  // )
  // .option(
  //   '--i, --install-deps <packageManager>',
  //   'Install dependencies (supports npm, yarn, pnpm & bun)'
  // )
  // .option('--kg, --keep-git', 'Do not delete ".git" folder')
  .action(async () => {
    try {
      throw new Error("Function not implemented yet.");
      
    } catch (error) {
      logger.error("An error occured or user aborted.", error)
    }
  });

  program.parse() // NOTE: SHOULD BE AT THE END