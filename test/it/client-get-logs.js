const expect = require('chai').expect;

const okta = require('../../');
const models = require('../../src/models');

let orgUrl = process.env.OKTA_CLIENT_ORGURL;

if (process.env.OKTA_USE_MOCK) {
  orgUrl = `${orgUrl}/client-get-application`;
}

const client = new okta.Client({
  orgUrl: orgUrl,
  token: process.env.OKTA_CLIENT_TOKEN
});

describe.only('client.getLogs()', () => {

  it('should allow me to to get application logs', async () => {
    const collection = await client.getLogs();
    await collection.each(async (logEvent)=>{
      expect(logEvent).to.be.instanceof(models.LogEvent);
      /**
       * The Logs API will continuously return new pages so that you can poll for new events.
       * As such we need to manually stop iteration.
       */
      return false;
    });
  });

});
