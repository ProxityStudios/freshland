import { Args, Command, Flags, ux } from '@oclif/core';
import { freshland } from '../container';
import { FreshBuilder } from '../structures/FreshBuilder';

export default class Template extends Command {
  static override args = {
    template: Args.string({ description: 'TODO: show templates', required: true }),
    destination: Args.directory({ description: 'TODO:', required: true }),
  };

  static override description = 'use a template';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Template);

    const builder = new FreshBuilder().useTemplate(args.template).setDestination(args.destination);

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await freshland.clone(builder);
    ux.action.stop();
  }
}
