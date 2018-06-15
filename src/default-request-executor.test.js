// jest.mock('iso-fetch');

const fetch = require('isomorphic-fetch');

const DefaultRequestExecutor = require('./default-request-executor');

// should compute a retry time that is within the bounds

// should return a value that is within the bounds

describe('DefaultRequestExecutor', () => {
  describe('delayFetch')
  describe('parseResponse', () => {
    let requestExecutor;
    beforeEach(() => {
      requestExecutor = new DefaultRequestExecutor()
      requestExecutor.delayFetch = jest.fn();
    })
    it('should defer to delayFetch for 429 responses', () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const response = { status: 429 };

      requestExecutor.parseResponse(uri, request, response)
      expect(requestExecutor.delayFetch.mock.calls[0][0]).toBe(uri)
      expect(requestExecutor.delayFetch.mock.calls[0][1]).toBe(request)
      expect(requestExecutor.delayFetch.mock.calls[0][2]).toBe(response)
    });
    it('should return 200 responses', async () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const response = { status: 200 };
      const returnValue = await requestExecutor.parseResponse(uri, request, response)

      expect(returnValue).toEqual(response);
    });
    it('should return 401 responses', async () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const response = { status: 401 };
      const returnValue = await requestExecutor.parseResponse(uri, request, response)

      expect(returnValue).toEqual(response);
    });
    it('should return 500 responses', async () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const response = { status: 500 };
      const returnValue = await requestExecutor.parseResponse(uri, request, response)

      expect(returnValue).toEqual(response);
    });
  })
  describe('getDelayedRequest', () => {
    it('should set the X-Okta-Retry-For and X-Okta-Retry-Count headers', () => {
      const request = {
        method: 'GET'
      }
      const mockResponse = {
        headers: {
          get: (header) => {
            const headers = {
              'x-okta-request-id' : 'foo'
            }
            return headers[header];
          }
        }
      }
      const requestExecutor = new DefaultRequestExecutor();
      const newRequest = requestExecutor.getDelayedRequest(request, mockResponse);
      expect(newRequest.headers[requestExecutor.retryForHeader]).toBe('foo')
      expect(newRequest.headers[requestExecutor.retryCountHeader]).toBe(1)
    });
    it('should increment the X-Okta-Retry-Count header', () => {
      const requestExecutor = new DefaultRequestExecutor();
      const request = {
        method: 'GET',
        headers: {}
      }
      request.headers[requestExecutor.retryCountHeader] = 1;
      const mockResponse = {
        headers: {
          get: (header) => {
            const headers = {
              'x-okta-request-id' : 'foo'
            }
            return headers[header];
          }
        }
      }

      const newRequest = requestExecutor.getDelayedRequest(request, mockResponse);
      expect(newRequest.headers[requestExecutor.retryCountHeader]).toBe(2)
    });
  })
  describe('getRetryDelayMs', () => {
    it('should return a retry delay that is within the configured bounds', () => {
      const requestExecutor = new DefaultRequestExecutor();
      const now = new Date();
      const retryAfter = new Date(now.getTime() + (1000*60));// one minute in the future
      const retryBefore = new Date(retryAfter.getTime() + requestExecutor.rateLimitRandomOffsetMax);
      const futureEpochSeconds = requestExecutor.dateToEpochSeconds(retryAfter);
      const mockResponse = {
        headers: {
          get: (header) => {
            const headers = {
              'x-rate-limit-reset' : String(requestExecutor.dateToEpochSeconds(retryAfter)),
              'date': String(requestExecutor.dateToEpochSeconds(now))
            }
            return headers[header];
          }
        }
      }

      let retries = 0;
      while (retries < 100) {
        const delayMs = requestExecutor.getRetryDelayMs(mockResponse)
        const delayDate = new Date(now.getTime() + delayMs)
        expect(delayDate.getTime()).toBeGreaterThan(retryAfter.getTime())
        expect(delayDate.getTime()).toBeLessThan(retryBefore.getTime())
        retries ++;
      }
    })
  });
});
