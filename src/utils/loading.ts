import * as Loading from 'loading-cli'

const loading = Loading({
  color: 'yellow',
  interval: 80,
  stream: process.stdout,
})

export default loading
