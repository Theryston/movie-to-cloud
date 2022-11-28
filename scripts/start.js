#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const Loading = require('loading-cli')
const { exec } = require('child_process')
const { promisify } = require('util')
const { print } = require('gluegun')

const execAsync = promisify(exec)

const loading = Loading({
  color: 'yellow',
})

const useCompiled = process.argv.indexOf('--use-tsnode') === -1

const main = async () => {
  if (useCompiled) {
    const buildPath = path.join(__dirname, '..', 'build')

    if (!fs.existsSync(buildPath)) {
      loading.start('Building...')
      await execAsync('yarn run build')
      loading.succeed('Build complete!')
    }

    require(`${__dirname}/../build/cli`).run(process.argv)
  } else {
    print.info(print.colors.yellow('Using ts-node'))
    require('ts-node').register({ project: `${__dirname}/../tsconfig.json` })
    require(`${__dirname}/../src/cli`).run(process.argv)
  }
}

main()
