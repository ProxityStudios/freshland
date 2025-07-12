import { Args, Command, Flags } from '@oclif/core';
import { freshland } from '../../container';

export default class GlobalProxySet extends Command {
  static override args = {
    proxy: Args.string({
      description: 'The global proxy to set, e.g., "http://username:password@ip:port"',
      required: true,
    }),
  };

  static override description = 'TODO:';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GlobalProxySet);

    freshland.setGlobalProxy(args.proxy);
    this.log('Global proxy set to flags:', args.proxy);
  }
}
