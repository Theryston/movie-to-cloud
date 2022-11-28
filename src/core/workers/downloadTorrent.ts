import * as path from 'path'
import * as WebTorrent from 'webtorrent'
import * as fs from 'fs'
import type { done } from 'fastq'
import { DownloadTorrentWorkerArgs } from '../../types'

export function downloadTorrent(
  args: DownloadTorrentWorkerArgs,
  cb: done
): void {
  const { torrentHash, path: savePath, multibar, tmdbId } = args
  const client = new WebTorrent()
  client.add(torrentHash, { path: savePath }, (torrent) => {
    const bar = multibar.create(torrent.length, 0, {
      text: `Downloading ${tmdbId}`,
    })

    const result = {
      path: path.join(savePath, torrent.name),
      torrentHash,
    }

    torrent.on('download', (bytes: number) => {
      if (fs.existsSync(result.path)) {
        const isTorrentFolder = fs.lstatSync(result.path).isDirectory()

        if (!isTorrentFolder) {
          const pathWithoutExtension = result.path.replace(
            path.extname(result.path),
            ''
          )
          fs.mkdirSync(pathWithoutExtension)
          fs.renameSync(
            path.join(savePath, torrent.name),
            path.join(pathWithoutExtension, torrent.name)
          )
          result.path = pathWithoutExtension
        }
      }

      bar.increment(bytes)
    })

    torrent.on('done', () => {
      client.destroy()
      multibar.remove(bar)
      cb(null, result)
    })

    torrent.on('error', (error: any) => {
      client.destroy()
      multibar.remove(bar)
      cb(error, result)
    })
  })
}
