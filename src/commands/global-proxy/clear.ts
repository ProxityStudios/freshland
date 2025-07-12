import { Args, Command, Flags as OCFlags } from '@oclif/core';
import { freshland } from '../../container';
import { Flags, FreshlandBaseCommand } from '../../structures/freshlandBaseCommand';

export default class GlobalProxyClear extends FreshlandBaseCommand<typeof GlobalProxyClear> {
  static override args = {};

  static override description = 'TODO:';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {};

  public async run(): Promise<Flags<typeof GlobalProxyClear>> {
    const { args, flags } = await this.parse(GlobalProxyClear);

    freshland.clearGlobalProxy();
    this.log('Global proxy cleared successfully.');

    return this.flags;
  }
}
