import { Args, Command, Flags } from '@oclif/core';
import { ux } from '@oclif/core/ux';
import { freshland } from '../../container';
import { FreshBuilder } from '../../structures/FreshBuilder';

export default class Clone extends Command {
  static override args = {
    source: Args.string({ description: 'E.G: ProxityStudios/freshland', required: true }),
    destination: Args.directory({ description: 'Destination of the copied repository', required: true }),
  };

  static override description = 'Clone a repository from supported sources.';

  static override examples = ['<%= config.bin %> <%= command.id %> ProxityStudios/freshlland ./freshland-copy'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Clone);

    const builder = new FreshBuilder().setSource(args.source).setDestination(args.destination);

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    await freshland.clone(builder);
    ux.action.stop();
  }
}
