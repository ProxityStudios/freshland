import { Args, Command, Flags as OCFlags } from '@oclif/core';
import { repick } from '../container';
import { Flags, CLIBaseCommand } from '../structures/CLIBaseCommand';
import { Builder } from '@repick/core';
import path from 'node:path';

export default class Clone extends CLIBaseCommand<typeof Clone> {
  static override args = {
    source: Args.string({ description: 'E.G: ProxityStudios/typescript-starter', required: true }),
    destination: Args.directory({ description: 'Destination of the copied repository', required: true }),
  };

  static override description = 'Clone a repository from supported sources.';

  static override examples = ['<%= config.bin %> <%= command.id %> ProxityStudios/typescript-starter ./copy'];

  static override flags = {
    proxy: OCFlags.string({ description: 'Proxy URL to use for the request e.g: http://username:password@ip:port' }),
  };

  public async run(): Promise<Flags<typeof Clone>> {
    const { args, flags } = await this.parse(Clone);

    const builder = new Builder().setSource(args.source).setDestination(path.resolve(process.cwd(), args.destination));

    if (flags.proxy) builder.setProxy(flags.proxy);

    // ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await repick.clone(builder);
    // ux.action.stop();

    return this.flags;
  }
}
