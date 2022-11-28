import * as path from 'path'
import * as WebTorrent from 'webtorrent'
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
