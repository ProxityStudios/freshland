import { Args, Command, Flags as OCFlags, ux } from '@oclif/core';
import { input, select } from '@inquirer/prompts';
import { repick } from '../container';
import { Flags, CLIBaseCommand } from '../structures/CLIBaseCommand';
import { Builder, Parser } from '@repick/core';
import { CodeLanguage, RepickError } from '@repick/common';
import { getTemplateIfExistsOrThrow, getTemplates } from '../utils';
import path from 'node:path';

enum Action {
  CLONE = 'clone',
  TEMPLATE = 'template',
}

export default class GUI extends CLIBaseCommand<typeof GUI> {
  static override args = {};

  static override description = 'TODO: description of gui command';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  // TODO:
  static override flags = {
    proxy: OCFlags.string({ description: 'Proxy URL to use for the request e.g: http://username:password@ip:port' }),
  };

  public async run(): Promise<Flags<typeof GUI>> {
    const { args, flags } = await this.parse(GUI);

    const action = await select<Action>({
      message: 'Select an action',
      choices: [
        {
          name: 'Clone a repository',
          value: Action.CLONE,
          description: 'clones a repository',
        },
        {
          name: 'Use a template',
          value: Action.TEMPLATE,
          description: 'clones a template and configures it',
        },
      ],
    });

    switch (action) {
      case Action.CLONE:
        await this.runActionCLONE();
        break;
      case Action.TEMPLATE:
        await this.runActionTEMPLATE();
        break;
      default:
        throw new RepickError('Action not supported yet', 'INVALID_ACTION');
    }

    return this.flags;
  }

  private async runActionCLONE() {
    const answers = {
      repository: await input({
        message: 'Type in the source',
        required: true,
        validate(value) {
          try {
            Parser.parseSourceOrThrow(value);
            return true;
          } catch (error) {
            return 'Invalid source';
          }
        },
      }),
      destination: await input({
        message: 'Type in the destination',
        // default: '.',
        required: true,
      }),
    };

    const builder = new Builder().setSource(answers.repository).setDestination(path.resolve(process.cwd(), answers.destination));

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await repick.clone(builder);
    ux.action.stop();
  }

  // TODO: use enum
  private async runActionTEMPLATE() {
    const codeLanguage = await select<CodeLanguage>({
      message: 'Code langauge?',
      choices: [
        {
          name: 'TypeScript',
          value: 'typescript',
        },
        {
          name: 'JavaScript',
          value: 'javascript',
        },
      ],
    });

    // TODO: sort alfebatically
    const matchedTemplates = getTemplates().filter((t) => t.codeLanguage === codeLanguage);

    const answers = {
      template: await select({
        message: `Templates (${codeLanguage})`,
        choices: matchedTemplates.map((t) => ({ name: t.displayName, value: t.name })),
      }),
      destination: await input({
        message: 'Type in the destination',
        // default: '.',
        required: true,
      }),
    };

    const template = getTemplateIfExistsOrThrow(answers.template);

    const builder = new Builder().useTemplate(template).setDestination(path.resolve(process.cwd(), answers.destination));

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await repick.clone(builder);
    ux.action.stop();
  }
}
