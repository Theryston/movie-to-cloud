import * as fs from 'fs'

export default function getBiggestFile(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let biggestFile: string
    let biggestSize = 0

    fs.readdir(path, (err: any, files: string[]) => {
      if (err) {
        reject(err)
      }

      for (const file of files) {
        const stats = fs.statSync(path + '/' + file)

        if (stats.size > biggestSize) {
          biggestFile = file
          biggestSize = stats.size
        }
      }

      resolve(biggestFile)
    })
  })
}
