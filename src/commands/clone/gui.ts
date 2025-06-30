import { Args, Command, Flags, ux } from '@oclif/core';
import { prompt } from 'enquirer';
import { BaseCLICommand } from '../../structure/BaseCLICommand';
import { logger } from '../../logger';
import { freshland } from '../../container';
import { FreshBuilder } from '../../structure/FreshBuilder';
import { Parser } from '../../freshland/parser';

export default class CloneGui extends BaseCLICommand<typeof CloneGui> {
  static override args = {};

  static override description = 'describe the command here';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CloneGui);

    const response: { repository: string; destination: string } = await prompt([
      {
        type: 'input',
        name: 'repository',
        message: 'Which repository do you want to clone?',
        required: true,
        validate(value) {
          try {
            Parser.parseRepository(value);
            return true;
          } catch (error) {
            return false;
          }
        },
      },
      {
        type: 'input',
        name: 'destination',
        message: 'Where should I clone?',
        required: true,
      },
    ]);

    const builder = new FreshBuilder().setDestination(response.destination).setRepository(response.repository);
    ux.action.start('Starting process');
    ux.action.status = 'Process still in progress';
    ux.action.pauseAsync(async () => {});
    await freshland.clone(builder);
    ux.action.stop('Done! ready to go');
  }
}
