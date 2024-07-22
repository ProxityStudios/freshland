import {Command, Flags, Interfaces} from '@oclif/core'
import { logger } from '../logger'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCLICommand['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCLICommand<T extends typeof Command> extends Command {
  // add the --json flag
  static override enableJsonFlag = true

  static override baseFlags = {
    'mode': Flags.option({
      default: 'tar',
      helpGroup: 'GLOBAL',
      options: ['tar', "git"] as const,
      summary: 'Specify the mode.',
    })(),
  }

  protected flags!: Flags<T>
  protected args!: Args<T>

  public override async init(): Promise<void> {
    await super.init()
    const {args, flags} = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCLICommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })
    this.flags = flags as Flags<T>
    this.args = args as Args<T>
  }

  protected override async catch(err: Error & {exitCode?: number}): Promise<any> {
    return super.catch(err)
  }

  protected override async finally(_: Error | undefined): Promise<any> {
    return super.finally(_)
  }
}