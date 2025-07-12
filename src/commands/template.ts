import { Args, Command, Flags, ux } from '@oclif/core';
import type { CommandError } from '@oclif/core/interfaces';
import { freshland } from '../container';
import { FreshlandBuilder } from '../structures/freshlandBuilder';
import { ProcessStatus } from '../enums';

// TODO: Check existing version of templates.json and update if its outdated.
export default class Template extends Command {
  static override args = {
    template: Args.string({ description: 'TODO: show templates', required: true }),
    destination: Args.directory({ description: 'TODO:', required: true }),
  };

  static override description = 'TODO: description of template command';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Template);

    const builder = new FreshlandBuilder().useTemplate(args.template).setDestination(args.destination);

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
