# Movies To Cloud

This is a command line program made for adding movies to your favorite cloud, it is made with the main purpose of uploading to a cloud for people who need to feed the movies database to a possible API or whatever, but it can be used for any purpose.

## Clouds

- Google Drive

## Features

- Download movies
- Convert movie file to .MP4
- Renames the movie file to '{tmdbId}.mp4'
- Upload only the movie mp4 file to your cloud

## Installing

Starting this program is very simple, we can start by cloning the GitHub repository:

```bash
git clone https://github.com/Theryston/movie-to-cloud.git
cd movie-to-cloud
```

Now install the dependencies, remember that as we use [pnpm](https://pnpm.io/installation) it will be necessary to have it installed to run this project, once you have it just run:

```bash
pnpm install
```

After that the process can change a little depending on the cloud you choose but just follow the steps below

### Google Drive

To use google drive you need to create a project on the google cloud platform, enable google drive, configure an OAuth permission screen, create an OAuth 2.0 Client ID with the application type being Desktop App. Download the json file with the credentials of this OAuth 2.0 Client ID and rename it to `google-credentials.json` once done move it to the folder where you cloned the project

Now just run the project with `pnpm start` and select google drive. When you do this for the first time a google login page will open in your browser, login and go back to the terminal

## Running

To run this program from the command line just run `pnpm start` inside the project and it will be started, the program will ask you some questions such as the id of the folder where the movies should be placed or the number of movies that can be processed simultaneously inform this data so that the program runs

### Understanding folder id

The id of the folder in the case of google drive can be found in the url once you open the folder in your browser, look at the image below:

![Google Drive Url](https://i.ibb.co/0qsgYyY/Design-sem-nome-1.png)

### Understanding torrent hash

The torrent hash can be found in your Magnet link, the Magnet link is the link that exists in the buttons of the torrent sites that when you click it opens your torrent client. The hash can be found at the beginning of your Magnet link between the `magnet:?xt=urn:btih:` and the `&dn=` look at the image below:

![Torrent Hash](https://i.ibb.co/59KHzDS/Design-sem-nome.png)
