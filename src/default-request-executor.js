const RequestExecutor = require('./request-executor');

class DefaultOktaRequestExecutor extends RequestExecutor {
  constructor(config = {}) {
    super();
    this.rateLimitRandomOffsetMin = config.min || 500;
    this.rateLimitRandomOffsetMax = config.max || 1000;
    this.useDefaultRateLimitRetryStrategy = !!config.useDefaultRateLimitRetryStrategy;
  }
  fetch() {
    const args = Array.prototype.slice.apply(arguments);
    if (this.useDefaultRateLimitRetryStrategy) {
      return super.fetch.apply(this, args).then(this.defaultRateLimitRetryStrategy.bind(this, args));
    } else {
      return super.fetch.apply(this, args);
    }
  }
  validateFetchArgs(args) {
    const erro
    if (args.length > 3) {

    }
  }
  addRetryHeaders(fetchArgs) {
    let request;
    if (typeof fetchArgs[0] === 'string' && typeof fetchArgs[1] === 'object') {
      request = fetchArgs[0]
    } else if (typeof fetchArgs[0] === 'object') {
      request = fetchArgs[1]
    }
  }
  defaultRateLimitRetryStrategy(originalArgs, response) {
    if (response.status === 429) {
      const requestId = response.headers.get('x-okta-request-id');
      const retryEpochMs = parseInt(response.headers.get('x-rate-limit-reset'), 10) * 1000;
      const retryDate = new Date(retryEpochMs);
      const nowDate = new Date(response.headers.get('date'));
      const offset = Math.floor(Math.random() * this.rateLimitRandomOffsetMax) + this.rateLimitRandomOffsetMin;
      const delayMs = retryDate.getTime() - nowDate.getTime() + offset;
      return new Promise(resolve => {
        this.emit('backoff', response, requestId, delayMs);
        setTimeout(() => {
          this.emit('resume', response, requestId);
          resolve(this.fetch(uri, init));
        }, delayMs);
      });
    }
    return response;
  }
}

module.exports = DefaultOktaRequestExecutor;

