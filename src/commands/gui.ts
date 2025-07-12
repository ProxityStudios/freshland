import { Args, Command, Flags, ux } from '@oclif/core';
import { input, select } from '@inquirer/prompts';
import type { CommandError } from '@oclif/core/interfaces';
import { FreshlandParser } from '../freshland/utils/parser';
import { freshland } from '../container';
import { FreshlandBuilder } from '../structures/freshlandBuilder';
import { CodeLanguage } from '../types';
import { getTemplates } from '../freshland/utils';
import { ProcessStatus } from '../enums';
import { FreshlandError } from '../structures/freshlandError';

enum Action {
  CLONE = 'clone',
  TEMPLATE = 'template',
}

export default class GUI extends Command {
  static override args = {};

  static override description = 'TODO: description of gui command';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {};

  public async run(): Promise<void> {
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
        throw new FreshlandError('Action not supported yet', 'INVALID_ACTION');
    }
  }

  private async runActionCLONE() {
    const answers = {
      repository: await input({
        message: 'Type in the source',
        required: true,
        validate(value) {
          try {
            FreshlandParser.parseSourceOrThrow(value);
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

    const builder = new FreshlandBuilder().setSource(answers.repository).setDestination(answers.destination);

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await freshland.clone(builder);
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

    const builder = new FreshlandBuilder().useTemplate(answers.template).setDestination(answers.destination);

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await freshland.clone(builder);
    ux.action.stop();
  }

  protected override async catch(err: CommandError): Promise<any> {
    const error = err as Error;

    if (error.name === 'ExitPromptError') {
      console.error('OK. cancelling...');
      process.exit(ProcessStatus.OK);
    }

    console.error(error);
  }
}
