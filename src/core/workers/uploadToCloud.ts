import * as fs from 'fs'
import { UploadToCloudWorkerArgs } from '../../types'
import type { done } from 'fastq'

export function uploadToCloud(args: UploadToCloudWorkerArgs, cb: done): void {
  const { filePath, storage, folderId, multibar, tmdbId } = args
  const fileSize = fs.statSync(filePath).size
  const bar = multibar.create(fileSize, 0, {
    text: `Uploading ${tmdbId}`,
  })

  const result = {
    filePath,
    tmdbId,
  }

  storage.uploadFile(filePath, folderId, {
    onProgress: (bytes: number) => {
      bar.update(bytes)
    },
    onError: (error: any) => {
      multibar.remove(bar)
      cb(error, result)
    },
    onEnd: (fileId: string) => {
      multibar.remove(bar)
      cb(null, { ...result, fileId })
    },
  })
}
