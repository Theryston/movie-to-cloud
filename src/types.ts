export interface IStorage {
  getClient(): Promise<void>
  findFileName(id: string): Promise<string>
  uploadFile(
    filePath: string,
    folderId: string,
    { onProgress, onError, onEnd }: IUploadFileOptions
  ): void
}

export interface IUploadFileOptions {
  onProgress: (bytes: number) => void
  onError: (error: any) => void
  onEnd: (fileId: string) => void
}

export type WorkerArgs = {
  step: 'DOWNLOAD' | 'CONVERT' | 'UPLOAD'
  body: any
}

export type DownloadTorrentWorkerArgs = {
  torrentHash: string
  path: string
  tmdbId: string
  multibar: any
}

export type MkvToMp4WorkerArgs = {
  input: string
  output: string
  tmdbId: string
  multibar: any
}

export type UploadToCloudWorkerArgs = {
  filePath: string
  folderId: string
  tmdbId: string
  storage: IStorage
  multibar: any
}

export interface IMovie {
  tmdbId: string
  torrentHash: string
  status: 'DOWNLOADING' | 'CONVERTING' | 'UPLOADING' | 'DONE' | 'ERROR'
}
