import { build } from 'gluegun'

async function run(argv: string[]) {
  const cli = build()
    .brand('movie-to-cloud')
    .src(__dirname)
    .help()
    .version()
    .create()

  const toolbox = await cli.run(argv)

  return toolbox
}

module.exports = { run }
