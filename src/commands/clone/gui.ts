import { Args, Command, Flags, ux } from '@oclif/core';
import { input } from '@inquirer/prompts';
import { freshland } from '../../container';
import { FreshBuilder } from '../../structures/FreshBuilder';
import { Parser } from '../../freshland/utils/parser';

export default class CloneGUI extends Command {
  static override args = {};

  static override description = 'description of clone (gui) command';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CloneGUI);

    const repository = await input({
      message: 'Type in the repository full name',
      validate(value) {
        try {
          Parser.parseRepository(value);
          return true;
        } catch (error) {
          return false;
        }
      },
    });

    const destination = await input({
      message: 'Type in the destination',
    });

    const builder = new FreshBuilder().setRepository(repository).setDestination(destination);

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    // ux.action.pauseAsync(async () => {});
    await freshland.clone(builder);
    ux.action.stop();
  }
}
