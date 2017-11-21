// const expect = require('chai').expect;

// const okta = require('../../');
// const utils = require('../utils');

// let orgUrl = process.env.OKTA_CLIENT_ORGURL;

// if (process.env.OKTA_USE_MOCK) {
//   orgUrl = `${orgUrl}/application-update-user`;
// }

// const client = new okta.Client({
//   orgUrl: orgUrl,
//   token: process.env.OKTA_CLIENT_TOKEN
// });

// describe.skip('client.updateApplicationUser()', () => {

//   it('should allow to update an app user', async () => {
//     const application = {
//       name: 'template_basic_auth',
//       label: 'Sample Basic Auth App',
//       signOnMode: 'BASIC_AUTH',
//       settings: {
//         app: {
//           authURL: 'https://example.com/auth.html',
//           url: 'https://example.com/bookmark.htm'
//         }
//       }
//     };

//     const user = {
//       profile: {
//         firstName: 'John',
//         lastName: 'Activate',
//         email: 'john-activate@example.com',
//         login: 'john-activate@example.com'
//       },
//       credentials: {
//         password: { value: 'Abcd1234' }
//       }
//     };

//     let createdApplication;
//     let createdUser;
//     let createdAppUser;

//     try {
//       await utils.removeAppByLabel(client, application.label);
//       await utils.cleanup(client, user);
//       createdApplication = await client.createApplication(application);
//       await client.http.postJson(`${client.baseUrl}/api/v1/meta/schemas/apps/${createdApplication.id}/default`, {
//         body:{
//           definitions: {
//             "custom": {
//               "id": "#custom",
//               "type": "object",
//               "properties": {
//                   "customPropertyName": {
//                       "title": "Title of custom property",
//                       "description": "Description of custom property",
//                       "type": "string"
//                   }
//               },
//               "required": []
//             }
//           }
//         }
//       });
//       createdUser = await client.createUser(user);
//       createdAppUser = await client.assignUserToApplication(createdApplication.id, {
//         id: createdUser.id
//       });
//       await client.updateApplicationUser(createdApplication.id, createdAppUser.id, {
//         profile: {
//           foo: 'foo@bar.com'
//         }
//       });
//       const fetchedAppUser = await client.getApplicationUser(createdApplication.id, createdAppUser.id);
//       expect(fetchedAppUser.profile.foo).to.equal('foo@bar.com');
//     } finally {
//       if (createdApplication) {
//         await createdApplication.deactivate();
//         await createdApplication.delete();
//       }
//       if (createdUser) {
//         await utils.cleanup(client, createdUser);
//       }
//       if (createdAppUser) {
//         await utils.cleanup(client, createdAppUser);
//       }
//     }
//   });

// });

