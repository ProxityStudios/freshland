import { Args, Command, Flags as OCFlags } from '@oclif/core';
import { freshland } from '../../container';
import { Flags, FreshlandBaseCommand } from '../../structures/freshlandBaseCommand';

export default class GlobalProxyClear extends FreshlandBaseCommand<typeof GlobalProxyClear> {
  static override args = {
    proxy: Args.string({
      description: 'The global proxy to set, e.g., "http://username:password@ip:port"',
      required: true,
    }),
  };

  static override description = 'TODO:';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {};

  public async run(): Promise<Flags<typeof GlobalProxyClear>> {
    const { args, flags } = await this.parse(GlobalProxyClear);

    // TODO: Validate the proxy format if necessary

    freshland.setGlobalProxy(args.proxy);
    this.log('Global proxy set to flags:', args.proxy);

    return this.flags;
  }
}
