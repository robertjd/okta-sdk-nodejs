const okta = require('./src');
const faker = require('faker')

function makeNewUser() {
  const email = faker.internet.email();
  return {
    profile: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: email,
      login: email,
    },
    credentials: {
      password : {
        value: 'PasswordAbc123'
      }
    }
  };
}

let reqCount = 0;


class MyExecutor extends okta.DefaultRequestExecutor {
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

// loggingExecutorWithRetry.on('request', request => console.log('request', request));
// loggingExecutorWithRetry.on('response', response => console.log('response', response));

const client = new okta.Client({
  // requestExecutor: loggingExecutorWithRetry
});

client.requestExecutor.on('request', (request) => {
  console.log(`Request ${request.url} `)
})

client.requestExecutor.on('response', (response) => {
  console.log(`Response ${response.status} `)
})

loggingExecutorWithRetry.on('backoff', (request, response, requestId, delayMs) => {
  console.log(`Backoff ${delayMs} ${requestId}, ${request.url} `)
})

loggingExecutorWithRetry.on('resume', (request, requestId) => {
  console.log(`Resume ${requestId}, ${request.url} `)
})


// function go(next){
//   return client.listApplications().each((user => {

//   }))
//   .then(() => {
//     console.log(new Date() + ' collection finished');
//     return next(next)
//   })
//   .catch(err => {
//     console.error(err)
//   })
// }


// function go(next){
//   return client.createUser(makeNewUser())
//   .then(user => {
//     console.log(`new user ${user.id}`);
//     return next(next)
//   })
//   .catch(err => {
//     debugger
//     console.error(err)
//   })
// }

function go(next){
  return client.getApplication('0oadio3tyvuJle6k80h7').then(user => {
    console.log(`${reqCount} ${user.id}`);
    return next(next)
  })
  .catch(err => {
    debugger
    console.error(err)
  })
}

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
