import { Args, Command, Flags } from '@oclif/core'
import { ux } from '@oclif/core/ux'
import { BaseCLICommand } from '../../structure/BaseCLICommand'
import { freshland } from '../../root/container'
import { Builder } from '../../freshland/utils/builder'

export default class CloneIndex extends BaseCLICommand<typeof CloneIndex> {
  static override args = {
    repository: Args.string({ description: "SOURCE_REPO", required: true }),
    destination: Args.directory({ description: "DESTINATION_DIR", required: true })
  }

  static override description = 'describe the command here'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CloneIndex)

    const builder = new Builder().setRepository(args.repository).setDestination(args.destination)

    ux.action.start('Starting process')
    ux.action.status = 'Process still in progress'
    ux.action.pauseAsync(async () => {
    })
    await freshland.clone(builder)
    ux.action.stop("Done! ready to go")
  }
}
