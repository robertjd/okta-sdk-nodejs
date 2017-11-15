/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


/* THIS FILE IS AUTO-GENERATED - SEE CONTRIBUTOR DOCUMENTATION */

var PublicSignOnModeMediated = require('./PublicSignOnModeMediated');


/**
 * @class WsFederationSignOn
 * @extends PublicSignOnModeMediated
 * @property { boolean } assertionSigned
 * @property { object } attributeStatements
 * @property { string } audience
 * @property { string } audienceOverride
 * @property { string } authnContextClassRef
 * @property { string } defaultRelayState
 * @property { string } destination
 * @property { string } destinationOverride
 * @property { string } digestAlgorithm
 * @property { object } honorForceAuthn
 * @property { string } idpIssuer
 * @property { string } recipient
 * @property { string } recipientOverride
 * @property { boolean } responseSigned
 * @property { string } signatureAlgorithm
 * @property { string } ssoAcsUrl
 * @property { string } ssoAcsUrlOverride
 * @property { string } subjectNameIdFormat
 * @property { string } subjectNameIdTemplate
 */
class WsFederationSignOn extends PublicSignOnModeMediated {
  constructor(resourceJson, client) {
    super(resourceJson, client);

  }

}

module.exports = WsFederationSignOn;
