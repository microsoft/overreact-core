import _ from 'underscore';
import React from 'react';
import {
  DataFetcher,
  Environment,
  Store,

  middlewareTypes,
  createFetchPolicyMiddleware,
  createErrorMiddleware,
  createInstrumentationMiddleware,
} from '@microsoft/overreact';

// Previously defined schema and network requestor
import { networkRequestor } from './network-requestor';
import { schema } from './schema';

// React component that will talk to the TripPin service
import { PeopleContainer } from './people-container';

const errorCodes = [
  'AUTHORIZATIONEXPIRE',
  'BINGPREVIEWAPIERROR',
  'CAMPAIGNINLINEEDITORIALERROR',
  'CCMTERRORNUMBER_POSTPAYACCOUNTCANTASSOCIATEWITHPREPAIDCARD',
  'DUPLICATEENTITY',
  'ENTITYDOESNOTEXIST',
  'EXCEEDACCOUNTGOALLIMIT',
  'EXCEEDTHELIMIT',
  'ExpandedTextAdInlineEditorialError',
  'FACEBOOKAPIUSERERROR',
  'GOALHAVEDUPLICATENAME',
  'GOALHAVEDUPLICATEURLANDOPERATOR',
  'INSUFFICIENTPERMISSIONORNEEDENABLE2FA',
  'INVALIDACTION',
  'INVALIDACTIONONSMARTPAGEASSOCIATEDMCACAMPAIGN',
  'INVALIDBUSINESSNAME',
  'INVALIDDESTINATIONGOALOPERATOR',
  'INVALIDKEYWORDTEXT',
  'INVALIDPARAMETER',
  'INVALIDVALUE',
  'INVALIDZIPCODE',
  'KEYWORDINLINEEDITORIALERROR',
  'LINKEDINAPIERROR',
  'LOCATIONNOTEXIST',
  'LOCATIONNOTSUPPORTED',
  'MEDIASIZEEXCEEDLIMIT',
  'NEEDADMINPERMISSION',
  'NEEDBUSINESSADMINPERMISSION',
  'PAYMENTNOTSET',
  'PROFILEALREADYLINKED',
  'SMARTPAGEINVALIDSUBDOMAIN',
  'SMARTPAGESUBDOMAINISNOTAVAILABLE',
  'TIMEZONENOTMATCH',
  'TOKENEXPIRED',
  'TOKENNOTMATCHTOPROFILE',
  'TWITTERAPIERROR',
  'TWITTERAPIUSERERROR',
  'UNSUPPORTEDWEBSITEDOMAIN',
  'URLNOTACCESSIBLE',
];

const expectedErrorCodes = _.chain(errorCodes)
  .map(errorCode => errorCode.trim().toUpperCase())
  .value();

function isExpectedErrorCodes(errorResponseJson) {
  if (_.isEmpty(errorResponseJson)) {
    return false;
  }
  const errorCodesInResponse = _.chain(errorResponseJson)
    .pluck('Code')
    .compact()
    .map(code => code.trim().toUpperCase())
    .uniq()
    .value();

  if (_.isEmpty(errorCodesInResponse)) {
    return false;
  }

  for (let index = 0; index < errorCodesInResponse.length; index += 1) {
    if (!_.contains(expectedErrorCodes, errorCodesInResponse[index])) {
      return false;
    }
  }
  return true;
}


export const middlewares = {
  [middlewareTypes.FETCH_POLICY]: createFetchPolicyMiddleware(),
  [middlewareTypes.ERROR]: createErrorMiddleware(),
  [middlewareTypes.INSTRUMENTATION]: createInstrumentationMiddleware({
    pageTrackingId: '123',
    loggerFunc: {
      traceFunc: ({
        requestId, message, api, httpMethod, statusCode,
      }) => {
        console.log(message || '', api, requestId, httpMethod, statusCode);
      },
      errorFunc: ({
        requestId, api, httpMethod, message, statusCode,
      }) => {
        console.error(message || '', api, requestId, null /* impact user */, httpMethod, statusCode);
      },
      perfFunc: ({
        requestId, api, httpMethod, timeTaken, message, isMethodEnter, statusCode,
      }) => {
        console.log(
          requestId, api, isMethodEnter,
          httpMethod, timeTaken, null /* pass */, message, statusCode,
        );
      },
    },
    errorMappers: [
      {
        check: error => {
          const errorArray = error.responseJSON && Array.isArray(error.responseJSON.value)
            ? error.responseJSON.value
            : error.responseJSON;
          return isExpectedErrorCodes(errorArray);
        },
      },
    ],
    stubOptions: { lcid: '1033' },
  }),
};

// define an Environment object to configure overreact
const store = new Store();
const tripPinEnvironment = new Environment(networkRequestor, schema, store, middlewares);

export default function App() {
  return (
    <div className="app-container">
      <DataFetcher environment={tripPinEnvironment}>
        <PeopleContainer userName="russellwhyte" />
      </DataFetcher>
    </div>
  );
}
