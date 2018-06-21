const okta = require('./src');
const DefaultRequestExecutor = require('./src/default-request-executor');

const requestExecutor = new DefaultRequestExecutor({
  // optional configuration
})

requestExecutor.on('request', (request) => {
  console.log(`Request ${request.url} `)
})

requestExecutor.on('backoff', (request, response, requestId, delayMs) => {
  console.log(`Backoff ${delayMs} ${requestId}, ${request.url} `)
})

requestExecutor.on('resume', (request, requestId) => {
  console.log(`Resume ${requestId}, ${request.url} `)
})

const client = new okta.Client({
  requestExecutor: new okta.RequestExecutor()
});


// client.getUser('00udq9c30oSNHtuiG0h7')
//   .then(user => {
//     console.log(user)
//   })
//   .catch(err => {
//     const resetAt = err.headers.get('x-rate-limit-reset')
//     console.error(resetAt);
//   })

client.getLogs().subscribe({
  interval: 1,
  next: item => {
    console.log(item.published, item.displayMessage);
  },
  error: err => {
    console.log(err)
  }
})
