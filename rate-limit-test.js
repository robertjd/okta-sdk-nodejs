const okta = require('./src');
const DefaultRequestExecutor = require('./src/default-request-executor');

let reqCount = 0;

const requestExecutor = new DefaultRequestExecutor({
  // optional configuration
})

class MyExecutor extends DefaultRequestExecutor {
  fetch(request) {
    reqCount+=1;
    return super.fetch(request);
  }
}

class LoggingExecutorWithRetry extends okta.DefaultRequestExecutor {
  fetch(request) {
    const start = new Date()
    console.log(`Begin request for ${request.url}`)
    return super.fetch(request).then(response => {
      const timeMs = new Date() - start
      console.log(`Request complete for ${request.url} in ${timeMs}ms`)
      return response; // Or a promise that will return the response
    })
  }
}

const loggingExecutorWithRetry = new LoggingExecutorWithRetry();

loggingExecutorWithRetry.on('request', request => console.log('request', request));
loggingExecutorWithRetry.on('response', response => console.log('response', response));

const client = new okta.Client({
  requestExecutor: loggingExecutorWithRetry
});

loggingExecutorWithRetry.on('backoff', (request, response, requestId, delayMs) => {
  console.log('backoff', request, response.headers, requestId, delayMs)
})

loggingExecutorWithRetry.on('resume', (request, requestId) => {
  console.log('resume', request, requestId)
})


function go(next){
  return client.listApplications().each((user => {

  }))
  .then(() => {
    console.log(new Date() + ' collection finished');
    return next(next)
  })
}

// function go(next){
//   return client.getUser('00udq9c30oSNHtuiG0h7').then(user => {
//     console.log(`${reqCount} ${user.id}`);
//     return next(next)
//   })
// }

// function go(next){
//   const body = {
//     "username": "a-username-here",
//     "password": "a-password-here",
//     "options": {
//       "multiOptionalFactorEnroll": true,
//       "warnBeforePasswordExpired": true
//     }
//   }
//   return client.http.postJson('https://dev-259824.oktapreview.com/api/v1/authn',{body}).then(() => {
//     console.log(new Date(), err.status)
//     return next(next)
//   }).catch((err) => {
//     console.log(new Date(), err.status)
//     return next(next)
//   })
// }

function printRateLimit(worker, err) {
  if (err.status === 429) {
    const reset = err.headers.get('x-rate-limit-reset')
    console.error('429', worker, new Date(reset * 1000));
  }
}
const numWorkers = 10;

const workers = [];

while (workers.length < numWorkers) {
  workers.push(go(go).catch(printRateLimit.bind(null, workers.length+1)))
}

console.log(workers.length, ' workers')
