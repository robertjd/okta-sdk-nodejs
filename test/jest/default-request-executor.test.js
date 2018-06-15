const DefaultRequestExecutor = require('../../src/default-request-executor');

// should return a value that is within the bounds

function buildMockResponse(response) {
  response = response || {};
  response.headers = response.headers || {};
  Object.assign(response.headers, {
    get: (header) => {
      return response.headers[header];
    }
  });
  return response;
}

describe('DefaultRequestExecutor', () => {

  describe('buildRetriedRequest', () => {

    it('should set the X-Okta-Retry-For and X-Okta-Retry-Count headers', () => {
      const request = {
        method: 'GET'
      };
      const mockResponse = buildMockResponse({
        headers: {
          'x-okta-request-id' : 'foo'
        }
      });
      const requestExecutor = new DefaultRequestExecutor();
      const newRequest = requestExecutor.buildRetriedRequest(request, mockResponse);
      expect(newRequest.headers[requestExecutor.retryForHeader]).toBe('foo');
      expect(newRequest.headers[requestExecutor.retryCountHeader]).toBe(1);
    });

    it('should increment the X-Okta-Retry-Count header', () => {
      const requestExecutor = new DefaultRequestExecutor();
      const request = {
        method: 'GET',
        headers: {}
      };
      request.headers[requestExecutor.retryCountHeader] = 1;
      const mockResponse = {
        headers: {
          get: (header) => {
            const headers = {
              'x-okta-request-id' : 'foo'
            };
            return headers[header];
          }
        }
      };
      const newRequest = requestExecutor.buildRetriedRequest(request, mockResponse);
      expect(newRequest.headers[requestExecutor.retryCountHeader]).toBe(2);
    });
  });

  describe('getRetryDelayMs', () => {
    it('should return a retry delay that is within the configured bounds', () => {
      const requestExecutor = new DefaultRequestExecutor();
      const now = new Date();
      const retryAfter = new Date(now.getTime() + (1000 * 60));// one minute in the future
      const retryBefore = new Date(retryAfter.getTime() + requestExecutor.rateLimitRandomOffsetMax);
      const mockResponse = buildMockResponse({
        headers: {
          'x-rate-limit-reset' : String(requestExecutor.dateToEpochSeconds(retryAfter)),
          date: String(requestExecutor.dateToEpochSeconds(now))
        }
      });
      let retries = 0;
      while (retries < 100) { // Try this a bunch of times because the offet is random
        const delayMs = requestExecutor.getRetryDelayMs(mockResponse);
        const delayDate = new Date(now.getTime() + delayMs);
        expect(delayDate.getTime()).toBeGreaterThan(retryAfter.getTime());
        expect(delayDate.getTime()).toBeLessThan(retryBefore.getTime());
        retries ++;
      }
    });
  });

  describe('retryRequest', () => {
    it('should build a new request and send it to fetch', async () => {
      const requestExecutor = new DefaultRequestExecutor();
      const now = new Date();
      const retryAfter = new Date(now.getTime() + (1000 * 60)); // one minute in the future
      const uri = '/foo';
      const mockRequest = { method: 'GET' };
      requestExecutor.fetch = jest.fn();
      requestExecutor.getRetryDelayMs = jest.fn().mockImplementation(() => 1);
      const mockResponse = buildMockResponse({
        headers: {
          'x-rate-limit-reset' : String(requestExecutor.dateToEpochSeconds(retryAfter)),
          date: String(requestExecutor.dateToEpochSeconds(now))
        }
      });
      const newRequest = requestExecutor.buildRetriedRequest(mockRequest, mockResponse);
      await requestExecutor.retryRequest(uri, mockRequest, mockResponse);
      expect(requestExecutor.fetch.mock.calls[0][0]).toBe(uri);
      expect(requestExecutor.fetch.mock.calls[0][1]).toMatchObject(newRequest);
    });
  });

  describe('parseResponse', () => {

    let requestExecutor;

    beforeEach(() => {
      requestExecutor = new DefaultRequestExecutor();
      requestExecutor.retryRequest = jest.fn();
    });

    it('should defer to delayFetch for 429 responses', () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const mockResponse = buildMockResponse({ status: 429 });

      requestExecutor.parseResponse(uri, request, mockResponse);
      expect(requestExecutor.retryRequest.mock.calls[0][0]).toBe(uri);
      expect(requestExecutor.retryRequest.mock.calls[0][1]).toBe(request);
      expect(requestExecutor.retryRequest.mock.calls[0][2]).toBe(mockResponse);
    });

    it('should return 200 responses', async () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const response = { status: 200 };
      const returnValue = await requestExecutor.parseResponse(uri, request, response);

      expect(returnValue).toEqual(response);
    });

    it('should return 401 responses', async () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const response = { status: 401 };
      const returnValue = await requestExecutor.parseResponse(uri, request, response);

      expect(returnValue).toEqual(response);
    });

    it('should return 500 responses', async () => {
      const uri = '/foo';
      const request = { method: 'GET' };
      const response = { status: 500 };
      const returnValue = await requestExecutor.parseResponse(uri, request, response);

      expect(returnValue).toEqual(response);
    });
  });
});
