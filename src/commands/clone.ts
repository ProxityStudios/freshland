import { Args, Command, Flags as OCFlags } from '@oclif/core';
import { freshland } from '../container';
import { FreshlandBuilder } from '../structures/freshlandBuilder';
import { Flags, FreshlandBaseCommand } from '../structures/freshlandBaseCommand';

export default class Clone extends FreshlandBaseCommand<typeof Clone> {
  static override args = {
    source: Args.string({ description: 'E.G: ProxityStudios/freshland', required: true }),
    destination: Args.directory({ description: 'Destination of the copied repository', required: true }),
  };

  static override description = 'Clone a repository from supported sources.';

  static override examples = ['<%= config.bin %> <%= command.id %> ProxityStudios/freshland ./freshland-copy'];

  static override flags = {
    proxy: OCFlags.string({ description: 'Proxy URL to use for the request e.g: http://username:password@ip:port' }),
  };

  public async run(): Promise<Flags<typeof Clone>> {
    const { args, flags } = await this.parse(Clone);

    const builder = new FreshlandBuilder().setSource(args.source).setDestination(args.destination);

    if (flags.proxy) builder.setProxy(flags.proxy);

    // ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await freshland.clone(builder);
    // ux.action.stop();

    return this.flags;
  }
}
