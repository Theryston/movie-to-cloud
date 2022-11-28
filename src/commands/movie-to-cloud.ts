import { GluegunCommand, print, prompt } from 'gluegun'
import { GoogleDrive } from '../core/storages/GoogleDrive'
import { IMovie, IStorage, WorkerArgs } from '../types'
import loading from '../utils/loading'
import * as fastq from 'fastq'
import * as path from 'path'
import * as fs from 'fs'
import type { queue as queueType } from 'fastq'

const downloadsPath = path.join(__dirname, '..', '..', 'downloads')

import * as cliProgress from 'cli-progress'
import getBiggestFile from '../utils/getBiggestFile'
import worker from '../core/workers'

const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: '{text} | {bar} {percentage}% | Speed: {eta}s',
  },
  cliProgress.Presets.shades_grey
)

const movies: IMovie[] = []

const STORAGES = {
  'Google Drive': GoogleDrive,
}

let storage: IStorage

let folder = {
  id: '',
  name: '',
}

let queue: queueType<WorkerArgs>

const command: GluegunCommand = {
  name: 'movie-to-cloud',
  run: async () => {
    print.info('Welcome to movie-to-cloud')
    print.info(
      "let's start by configuring the essential things for the CLI to run"
    )

    const { storageName } = await prompt.ask({
      type: 'select',
      name: 'storageName',
      message: 'Select storage',
      choices: Object.keys(STORAGES),
    })

    const Storage = STORAGES[storageName]
    storage = new Storage()
    loading.start(`Authenticating to ${storageName}`)
    try {
      await storage.getClient()
      loading.succeed(`Authenticated to ${storageName}`)
    } catch (error) {
      loading.fail(error.message)
      return
    }

    const { folderId } = await prompt.ask({
      type: 'input',
      name: 'folderId',
      message: 'Enter the id of the folder to put the movies in',
    })

    loading.start(`Finding the folder...`)
    let folderName: string
    try {
      folderName = await storage.findFileName(folderId)
      loading.succeed(`Found the folder: ${folderName}`)
    } catch (error) {
      loading.fail(error.message)
      return
    }

    folder = {
      id: folderId,
      name: folderName,
    }

    const { concurrencyStr } = await prompt.ask({
      type: 'input',
      name: 'concurrencyStr',
      message: 'How many movies do you want to process at the same time?',
    })
    const concurrency = Number(concurrencyStr)

    print.info(
      "Nice! Now let's start configure the movies that you want to process!"
    )

    let addMoreMovies = true
    while (addMoreMovies) {
      const { tmdbId, torrentHash } = await prompt.ask([
        {
          type: 'input',
          name: 'tmdbId',
          message: 'Enter the tmdb id of the movie',
        },
        {
          type: 'input',
          name: 'torrentHash',
          message: 'Enter the torrent hash of the movie',
        },
      ])

      movies.push({
        tmdbId,
        torrentHash,
        status: 'DOWNLOADING',
      })

      const addMore = await prompt.confirm('Do you want to add more movies?')

      addMoreMovies = addMore
    }

    queue = fastq(worker, concurrency)

    print.info('Perfect! Now let the magic happen!')

    for (const movie of movies) {
      queue.push(
        {
          step: 'DOWNLOAD',
          body: {
            torrentHash: movie.torrentHash,
            tmdbId: movie.tmdbId,
            path: downloadsPath,
            multibar,
          },
        },
        movieDownloadDone
      )
    }
  },
}

async function movieDownloadDone(
  error: any,
  result: {
    path: string
    torrentHash: string
  }
) {
  const movieIndex = movies.findIndex(
    (movie) => movie.torrentHash === result.torrentHash
  )

  if (error) {
    movies[movieIndex].status = 'ERROR'
    return
  }

  movies[movieIndex].status = 'CONVERTING'
  const movie = movies[movieIndex]

  const biggestFilePath = await getBiggestFile(result.path)

  queue.push(
    {
      step: 'CONVERT',
      body: {
        input: path.join(result.path, biggestFilePath),
        output: path.join(result.path, `${movie.tmdbId}.mp4`),
        tmdbId: movie.tmdbId,
        multibar,
      },
    },
    movieConvertDone
  )
}

async function movieConvertDone(
  error: any,
  result: {
    filePath: string
    tmdbId: string
  }
) {
  const movieIndex = movies.findIndex((movie) => movie.tmdbId === result.tmdbId)
  if (error) {
    movies[movieIndex].status = 'ERROR'
    return
  }

  movies[movieIndex].status = 'UPLOADING'
  const movie = movies[movieIndex]
  queue.push(
    {
      step: 'UPLOAD',
      body: {
        filePath: result.filePath,
        folderId: folder.id,
        tmdbId: movie.tmdbId,
        multibar,
        storage,
      },
    },
    movieUploadDone
  )
}

function movieUploadDone(
  error: any,
  result: {
    filePath: string
    tmdbId: string
  }
) {
  const movieIndex = movies.findIndex((movie) => movie.tmdbId === result.tmdbId)

  movies[movieIndex].status = 'DONE'

  if (error) {
    movies[movieIndex].status = 'ERROR'
  }

  const directoryPath = path.dirname(result.filePath)
  fs.rmdirSync(directoryPath, { recursive: true })

  const moviesNotDoneOrError = movies.filter(
    (movie) => movie.status !== 'DONE' && movie.status !== 'ERROR'
  )

  if (!moviesNotDoneOrError.length) {
    print.info('All movies were processed, look at the results:')
    for (const movie of movies) {
      print.info(`${movie.tmdbId} - ${movie.status}`)
    }
    process.exit(0)
  }
}

module.exports = command
