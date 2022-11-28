/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as path from 'path'
import * as fs from 'fs'
import { authenticate } from '@google-cloud/local-auth'
import { google } from 'googleapis'
import { IStorage, IUploadFileOptions } from '../../../types'

const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'google-token.json'
)
const CREDENTIALS_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'google-credentials.json'
)

export class GoogleDrive implements IStorage {
  client: any

  async getClient() {
    let client: any = this.loadSavedCredentialsIfExist()
    if (client) {
      this.client = client
      return
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    })
    if (client.credentials) {
      this.saveCredentials(client)
    }
    this.client = client
  }

  private loadSavedCredentialsIfExist() {
    try {
      const content = fs.readFileSync(TOKEN_PATH).toString()
      const credentials = JSON.parse(content)
      return google.auth.fromJSON(credentials)
    } catch (error) {
      return null
    }
  }

  private saveCredentials(client: any) {
    const content = fs.readFileSync(CREDENTIALS_PATH).toString()
    const keys = JSON.parse(content)
    const key = keys.installed || keys.web
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    })
    fs.writeFileSync(TOKEN_PATH, payload)
  }

  async findFileName(id: string) {
    const drive = google.drive({ version: 'v3', auth: this.client })
    const file = await drive.files.get({ fileId: id })
    return file.data.name
  }

  async uploadFile(
    filePath: string,
    folderId: string,
    options: IUploadFileOptions
  ) {
    const drive = google.drive({ version: 'v3', auth: this.client })
    const fileMetadata = {
      name: path.basename(filePath),
      parents: [folderId],
    }
    const media = {
      mimeType: 'video/mp4',
      body: fs.createReadStream(filePath),
    }

    drive.files.create(
      {
        media: media,
        fields: 'id',
        requestBody: fileMetadata,
      },
      {
        onUploadProgress: (event) => {
          options.onProgress(event.bytesRead)
        },
      },
      (err: any, file) => {
        if (err) {
          options.onError(err)
        } else {
          options.onEnd(file.data.id)
        }
      }
    )
  }
}
