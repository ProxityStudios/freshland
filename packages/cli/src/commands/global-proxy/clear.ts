import { Args, Command, Flags as OCFlags } from "@oclif/core";
import { repick } from "../../container";
import {
  Flags,
  CLIBaseCommand,
} from "../../structures/CLIBaseCommand";

export default class GlobalProxyClear extends CLIBaseCommand<
  typeof GlobalProxyClear
> {
  static override args = {};

  static override description = "TODO:";

  static override examples = ["<%= config.bin %> <%= command.id %> TODO:"];

  static override flags = {};

  public async run(): Promise<Flags<typeof GlobalProxyClear>> {
    const { args, flags } = await this.parse(GlobalProxyClear);

    repick.clearGlobalProxy();
    this.log("Global proxy cleared successfully.");

    return this.flags;
  }
}
