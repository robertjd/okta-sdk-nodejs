const EventEmitter = require('events').EventEmitter;
const isoFetch = require('isomorphic-fetch');

class RequestExecutor extends EventEmitter {
  constructor() {
    super();
  }
  fetch(uri, init) {
    return isoFetch(uri, init);
  }
}

module.exports = RequestExecutor;

