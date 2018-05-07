const EventEmitter = require('events').EventEmitter;
const isoFetch = require('isomorphic-fetch');

class DefaultOktaRequestExecutor extends EventEmitter {
  constructor(config = {}) {
    super();
    this.rateLimitRandomOffsetMin = config.min || 500;
    this.rateLimitRandomOffsetMax = config.max || 1000;
  }
  fetch(uri, init) {
    const self = this;
    return isoFetch(uri, init)
    .then((response) => {
      if (response.status === 429) {
        const requestId = response.headers.get('x-okta-request-id');
        const retryEpochMs = parseInt(response.headers.get('x-rate-limit-reset'), 10) * 1000;
        const retryDate = new Date(retryEpochMs);
        const nowDate = new Date(response.headers.get('date'));
        const offset = Math.floor(Math.random() * this.rateLimitRandomOffsetMax) + this.rateLimitRandomOffsetMin;
        const delayMs = retryDate.getTime() - nowDate.getTime() + offset;
        return new Promise(resolve => {
          self.emit('backoff', response, requestId, delayMs);
          setTimeout(() => {
            self.emit('resume', response, requestId);
            resolve(isoFetch(uri, init));
          }, delayMs);
        });
      }
      return response;
    });
  }
}

module.exports = DefaultOktaRequestExecutor;

