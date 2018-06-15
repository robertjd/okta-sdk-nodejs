const okta = require('./src');
const DefaultRequestExecutor = require('./src/default-request-executor');

const requestExecutor = new DefaultRequestExecutor({
  // optional configuration
})

const client = new okta.Client({
  requestExecutor: requestExecutor
});

requestExecutor.on('backoff', (request, requestId, delayMs) => {
  console.log('backoff', request, requestId, delayMs)
})

requestExecutor.on('resume', (request, requestId) => {
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

function printRateLimit(worker, err) {
  if (err.status === 429) {
    const reset = err.headers.get('x-rate-limit-reset')
    console.error(worker, new Date(reset * 1000));
  }
}

go(go).catch(printRateLimit.bind(null, '1'));
go(go).catch(printRateLimit.bind(null, '2'));
go(go).catch(printRateLimit.bind(null, '3'));
