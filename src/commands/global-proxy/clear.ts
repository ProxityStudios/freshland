import { Args, Command, Flags } from '@oclif/core';
import { freshland } from '../../container';

// TODO:
export default class GlobalProxyClear extends Command {
  static override args = {};

  static override description = 'TODO:';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GlobalProxyClear);

    // freshland.setGlobalProxy(args.proxy);
    // this.log('Global proxy set to http://' + freshland.options.globalProxy);
  }
}
