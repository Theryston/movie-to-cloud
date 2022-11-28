import { downloadTorrent } from './downloadTorrent'
import { mkvToMp4 } from './mkvToMp4'
import { uploadToCloud } from './uploadToCloud'

import type { WorkerArgs } from '../../types'
import type { done } from 'fastq'

export default function worker(args: WorkerArgs, cb: done): void {
  const steps = {
    DOWNLOAD: downloadTorrent,
    CONVERT: mkvToMp4,
    UPLOAD: uploadToCloud,
  }

  const { step, body } = args
  const stepFn = steps[step]

  stepFn(body, cb)
}
