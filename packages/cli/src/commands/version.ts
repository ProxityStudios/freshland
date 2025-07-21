import { Flags as OCFlags } from "@oclif/core";
import {
  Flags,
  CLIBaseCommand,
} from "../structures/CLIBaseCommand";

export default class Version extends CLIBaseCommand<typeof Version> {
  static override description = "TODO:";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override flags = {};

  public override async run(): Promise<Flags<typeof Version>> {
    this.log("Version:", this.config.version);
    this.log("Node Version: " + process.version);
    this.log("Platform: " + process.platform);
    this.log("Architecture: " + process.arch);

    return this.flags;
  }
}
