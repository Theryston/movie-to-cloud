import { readdir } from 'fs'

export default function getDirectories(path: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    readdir(path, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(
          files
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
        )
      }
    })
  })
}
