import { Args, Command, Flags } from '@oclif/core';
import { ux } from '@oclif/core/ux';
import { freshland } from '../../container';
import { FreshBuilder } from '../../structures/FreshBuilder';

export default class Clone extends Command {
  static override args = {
    repository: Args.string({ description: 'E.G: ProxityStudios/freshland', required: true }),
    destination: Args.directory({ description: 'Destination of the copied folder', required: true }),
  };

  static override description = 'Clones a repository';

  static override examples = ['<%= config.bin %> <%= command.id %> ProxityStudios/freshlland ./freshland-copy'];

  static override flags = {
    // gui: Flags.boolean(),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Clone);

    const builder = new FreshBuilder().setRepository(args.repository).setDestination(args.destination);

    ux.action.start('Cloning', 'Still in progress', { style: 'aesthetic' });
    // ux.action.pauseAsync(async () => {});
    await freshland.clone(builder);
    ux.action.stop();
  }
}
