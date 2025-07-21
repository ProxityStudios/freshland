import { Args, Command, Flags as OCFlags } from '@oclif/core';
import { repick } from '../../container';
import { Flags, CLIBaseCommand } from '../../structures/CLIBaseCommand';

export default class GlobalProxyClear extends CLIBaseCommand<typeof GlobalProxyClear> {
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

    repick.setGlobalProxy(args.proxy);
    this.log('Global proxy set to flags:', args.proxy);

    return this.flags;
  }
}
