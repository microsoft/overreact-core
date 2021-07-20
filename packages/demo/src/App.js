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

function isExpectedErrorCodes(errors) {
  console.log(errors);
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
