import { Args, Command, Flags as OCFlags, ux } from '@oclif/core';
import type { CommandError } from '@oclif/core/interfaces';
import { freshland } from '../container';
import { FreshlandBuilder } from '../structures/freshlandBuilder';
import { ProcessStatus } from '../enums';
import { Flags, FreshlandBaseCommand } from '../structures/freshlandBaseCommand';

// TODO: Check existing version of templates.json and update if its outdated.
export default class Template extends FreshlandBaseCommand<typeof Template> {
  static override args = {
    template: Args.string({ description: 'TODO: show templates', required: true }),
    destination: Args.directory({ description: 'TODO:', required: true }),
  };

  static override description = 'TODO: description of template command';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {
    proxy: OCFlags.string({ description: 'Proxy URL to use for the request e.g: http://username:password@ip:port' }),
  };

  public async run(): Promise<Flags<typeof Template>> {
    const { args, flags } = await this.parse(Template);

    const builder = new FreshlandBuilder().useTemplate(args.template).setDestination(args.destination);

    if (flags.proxy) builder.setProxy(flags.proxy);

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await freshland.clone(builder);
    ux.action.stop();

    return this.flags;
  }
}
