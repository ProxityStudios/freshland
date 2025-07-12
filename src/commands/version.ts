import { Args, Command, Flags, ux } from '@oclif/core';

// TODO:
export default class Version extends Command {
  static override args = {};

  static override description = 'TODO:';

  static override examples = ['<%= config.bin %> <%= command.id %> TODO:'];

  static override flags = {};

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Version);
    this.log('Running version command');
  }
}
