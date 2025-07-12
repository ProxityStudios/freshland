import { Flags as OCFlags } from '@oclif/core';
import { Flags, FreshlandBaseCommand } from '../structures/freshlandBaseCommand';

export default class Version extends FreshlandBaseCommand<typeof Version> {
  static override summary = 'child class that extends BaseCommand';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {};

  public override async run(): Promise<Flags<typeof Version>> {
    this.log('Version:', this.config.version);
    this.log('Node Version: ' + process.version);
    this.log('Platform: ' + process.platform);
    this.log('Architecture: ' + process.arch);

    return this.flags;
  }
}
