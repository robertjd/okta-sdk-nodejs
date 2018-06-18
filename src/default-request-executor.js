const RequestExecutor = require('./request-executor');

class DefaultOktaRequestExecutor extends RequestExecutor {
  constructor(config = {}) {
    super();
    this.maxElapsedTime = config.maxElapsedTime || 60000;
    this.rateLimitRandomOffsetMin = config.rateLimitRandomOffsetMin || 1000;
    this.rateLimitRandomOffsetMax = config.rateLimitRandomOffsetMax || 5000;
    this.retryCountHeader = 'X-Okta-Retry-Count';
    this.retryForHeader = 'X-Okta-Retry-For';
  }
  fetch(uri, request) {
    return super.fetch(uri, request).then(this.parseResponse.bind(this, uri, request));
  }
  buildRetryRequest(request, response) {
    const newRequest = Object.assign({}, request);
    const requestId = this.getOktaRequestId(response);
    if (!request.startTime) {
      newRequest.startTime = new Date();
    }
    if (!newRequest.headers) {
      newRequest.headers = {};
    }
    if (!newRequest.headers[this.retryForHeader]) {
      newRequest.headers[this.retryForHeader] = requestId;
    }
    newRequest.headers[this.retryCountHeader] =
      newRequest.headers[this.retryCountHeader] ?
      newRequest.headers[this.retryCountHeader] + 1 : 1;
    return newRequest;
  }
  getResponseDate(response) {
    return response.headers.get('date');
  }
  getOktaRequestId(response) {
    return response.headers.get('x-okta-request-id');
  }
  getRateLimitReset(response) {
    return response.headers.get('x-rate-limit-reset');
  }
  getRandomOffset() {
    return Math.round(Math.random() * this.rateLimitRandomOffsetMax);
  }
  getRetryDelayMs(response) {
    const nowDate = new Date(this.getResponseDate(response));
    const retryDate = new Date(parseInt(this.getRateLimitReset(response), 10) * 1000);
    const offset = this.getRandomOffset();
    return retryDate.getTime() - nowDate.getTime() + offset;
  }
  parseResponse(uri, request, response) {
    if (response.status === 429 && !this.requestIsMaxElapsed(request)) {
      return this.retryRequest(uri, request, response);
    }
    return response;
  }
  dateToEpochSeconds(date) {
    return Math.floor(date.getTime() / 1000);
  }
  requestIsMaxElapsed(request) {
    return request.startTime && ((new Date() - request.startTime) > this.maxElapsedTime);
  }
  retryRequest(uri, request, response) {
    const delayMs = this.getRetryDelayMs(response);
    const newRequest = this.buildRetryRequest(request, response);
    return new Promise(resolve => {
      const requestId = this.getOktaRequestId(response);
      this.emit('backoff', request, requestId, delayMs);
      setTimeout(() => {
        this.emit('resume', newRequest, requestId);
        resolve(this.fetch(uri, newRequest));
      }, delayMs);
    });
  }
}

module.exports = DefaultOktaRequestExecutor;

