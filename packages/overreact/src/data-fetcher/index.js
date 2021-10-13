import _ from 'underscore';
import React, { useRef, memo } from 'react';
import PropTypes from 'prop-types';

import { EnvironmentContext } from '../environment/context';

const MAX_REQUEST_BATCH_SIZE = 10;
const FETCH_INTERVAL = 50;
const INIT_MIDDLEWARE_STATES = { isResponseFromStore: false };

function executeRequests(environment, requests) {
  const pendingRequests = [
    ...requests,
  ];
  while (pendingRequests.length > 0) {
    const req = pendingRequests.shift();

    const {
      requestContract,
      spec,
      variables,
      data,
      id,
      mergedConfig,
    } = req;

    req.middlewareStates = {
      ...INIT_MIDDLEWARE_STATES,
    };

    const { responseContract } = spec;
    const {
      verb, uriFactoryFn, headerFactoryFn, payloadFactoryFn,
    } = requestContract;

    const uri = uriFactoryFn({ requestContract, variables, data });
    const header = headerFactoryFn && headerFactoryFn({ requestContract, variables, data });
    const payload = payloadFactoryFn && payloadFactoryFn({ requestContract, variables, data });

    const requestor = environment.getRequestor(id, spec, variables, req.middlewareStates, mergedConfig);

    requestor(uri, verb, header, payload).execute({
      onComplete: response => {
        responseContract.onGetResponse(environment, response, req);
      },
      onError: error => {
        responseContract.onGetError(environment, req, error);
      },
    });
  }
}

function batchRequests(environment, batchSize) {
  // console.log(`executing requests for batch size ${batchSize}`);

  // we'll try to batch requests
  const requests = [];
  while (requests.length < batchSize) {
    const request = environment.removeRequest();
    requests.push(request);
  }

  executeRequests(environment, requests);
}

export function useEnvironmentInitialization(environment) {
  // const [currentEnvironment, setCurrEnv] = useState(environment);
  const timer = useRef(null);

  // TODO: we need better way to subscribe here
  // current way will result in memory leak or other bugs when environment change
  environment.subscribe(() => {
    if (!timer.current) {
      clearTimeout(timer.current);
    }

    if (environment.requestCount() >= MAX_REQUEST_BATCH_SIZE) {
      // immediately execute requests to reduce queue size
      batchRequests(environment, MAX_REQUEST_BATCH_SIZE);
    } else {
      // a few requests outstanding, wait a bit to accumulate more.
      timer.current = setTimeout(() => {
        batchRequests(environment, environment.requestCount());
      }, FETCH_INTERVAL);
    }
  });
}

// default top-level data fetcher
export const DataFetcher = memo(props => {
  const {
    environment,
    environments,
    children,
  } = props;
  useEnvironmentInitialization(environment);
  _.each(environments, env => useEnvironmentInitialization(env));

  return (
    <EnvironmentContext.Provider value={[environment, environments]}>
      {children}
    </EnvironmentContext.Provider>
  );
});

DataFetcher.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  environment: PropTypes.object.isRequired,
  environments: PropTypes.arrayOf(PropTypes.object),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

DataFetcher.defaultProps = {
  environments: null,
};
