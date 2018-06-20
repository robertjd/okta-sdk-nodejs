const EventEmitter = require('events').EventEmitter;
const isoFetch = require('isomorphic-fetch');

class RequestExecutor extends EventEmitter {
  constructor() {
    super();
  }
  fetch(request) {
    this.emit('request', request);
    return isoFetch(request.url, request).then(response => {
      this.emit('response', response);
      return response;
    });
  }
}

module.exports = RequestExecutor;

