import { Args, Command, Flags as OCFlags, ux } from "@oclif/core";
import { repick } from "../container";
import {
  Flags,
  CLIBaseCommand,
} from "../structures/CLIBaseCommand";
import { Builder } from "@repick/core";
import { getTemplateIfExistsOrThrow } from "../utils";

// TODO: Check existing version of templates.json and update if its outdated.
export default class Template extends CLIBaseCommand<typeof Template> {
  static override args = {
    template: Args.string({
      description: "TODO: show templates",
      required: true,
    }),
    destination: Args.directory({ description: "TODO:", required: true }),
  };

  static override description = "TODO: description of template command";

  static override examples = ["<%= config.bin %> <%= command.id %> TODO:"];

  static override flags = {
    proxy: OCFlags.string({
      description:
        "Proxy URL to use for the request e.g: http://username:password@ip:port",
    }),
  };

  public async run(): Promise<Flags<typeof Template>> {
    const { args, flags } = await this.parse(Template);

    try {
      const template = getTemplateIfExistsOrThrow(args.template);

      const builder = new Builder()
        .useTemplate(template)
        .setDestination(args.destination);

      if (flags.proxy) builder.setProxy(flags.proxy);

      ux.action.start("Cloning", "Still in progress", { style: "aesthetic" });
      await repick.clone(builder);
      ux.action.stop();
    } catch (error) {
      this.error(`Template not found: ${args.template}`, {
        exit: 1,
      });
    }

    return this.flags;
  }
}
