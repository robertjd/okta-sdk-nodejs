const RequestExecutor = require('./request-executor');

class DefaultOktaRequestExecutor extends RequestExecutor {
  constructor(config = {}) {
    super();
    this.maxElapsedTime = config.maxElapsedTime || 10000;
    this.rateLimitRandomOffsetMin = config.rateLimitRandomOffsetMin || 5000;
    this.rateLimitRandomOffsetMax = config.rateLimitRandomOffsetMax || 1000;
  }
  fetch(uri, request) {
    return super.fetch(uri, request).then(this.defaultRateLimitRetryStrategy.bind(this, uri, request));
  }
  applyRetryHeaders(request, response) {
    const requestId = response.headers.get('x-okta-request-id');
    if (!request.headers) {
      request.headers = {};
    }
    if (!request.headers['X-Okta-Retry-For']) {
      request.headers['X-Okta-Retry-For'] = requestId;
    }
    request.headers['X-Okta-Retry-Count'] = request.headers['X-Okta-Retry-Count'] ? request.headers['X-Okta-Retry-Count']++ : 1;
    return request;
  }
  defaultRateLimitRetryStrategy(uri, request, response) {
    if (response.status === 429) {
      const retryEpochMs = parseInt(response.headers.get('x-rate-limit-reset'), 10) * 1000;
      const retryDate = new Date(retryEpochMs);
      const nowDate = new Date(response.headers.get('date'));
      const offset = Math.floor(Math.random() * this.rateLimitRandomOffsetMax) + this.rateLimitRandomOffsetMin;
      const delayMs = retryDate.getTime() - nowDate.getTime() + offset;
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.fetch(uri, this.applyRetryHeaders(request, response)));
        }, delayMs);
      });
    }
    return response;
  }
}

module.exports = DefaultOktaRequestExecutor;

