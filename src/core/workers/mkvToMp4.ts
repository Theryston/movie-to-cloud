import * as handbrake from 'handbrake-js'
import * as fs from 'fs'
import type { done } from 'fastq'
import { MkvToMp4WorkerArgs } from '../../types'

export function mkvToMp4(args: MkvToMp4WorkerArgs, cb: done): void {
  const { input, output, multibar, tmdbId } = args

  const result = {
    filePath: output,
    tmdbId,
  }

  if (fs.existsSync(output)) {
    cb(null, result)
    return
  }

  const bar = multibar.create(100, 0, {
    text: `Converting ${tmdbId}`,
  })

  handbrake
    .spawn({
      input,
      output,
    })
    .on('progress', (progress: any) => {
      bar.update(progress.percentComplete)
    })
    .on('error', (error: any) => {
      multibar.remove(bar)
      cb(error, result)
    })
    .on('end', () => {
      multibar.remove(bar)
      cb(null, result)
    })
}
