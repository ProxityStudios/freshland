import {Args, Command, Flags} from '@oclif/core'
import { BaseCLICommand } from '../../structure/BaseCLICommand'
import { prompt } from 'enquirer'
import { logger } from '../../root/logger'
import { freshland } from '../../root/container'
import { Builder } from '../../freshland/utils/builder'
import { Parser } from '../../freshland/utils/parser'

export default class CloneGui extends BaseCLICommand<typeof CloneGui> {
  static override args = {}

  static override description = 'describe the command here'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {}

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(CloneGui)

    const response: { repository: string; destination: string } = await prompt([
      {
        type: "input",
        name: "repository",
        message: "Which repository do you want to clone?",
        required: true,
        validate(value) {
          try {
            Parser.parseRepository(value)
            return true
          } catch (error) {
            return false
          }
        },
      },  
      {
        type: 'input',
        name: 'destination',
        message: 'Where should I clone?',
        required: true
      }
    ])

    const builder = new Builder().setDestination(response.destination).setRepository(response.repository)
    await freshland.clone(builder);
    logger.debug("GUI END");
  }
}
