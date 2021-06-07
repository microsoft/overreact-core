import _ from 'underscore';

import {
  FetchPolicy,
  IsNetworkPolicy,
  IsStorePolicy,
  IsStoreSecondaryPolicy,
  getFetchPolicy,
  getDataFromStore,
  shouldForceNetwork,
  updateDataRefStatus,
  DEFAULT_STORE_EXPIRATION_DURATION,
} from './fetch-policy-utils';

export function createFetchPolicyMiddleware(fetchPolicyMiddlewareOptions) {
  const {
    fetchPolicy = FetchPolicy.StoreOrNetwork,
    cacheExpirationDuration = DEFAULT_STORE_EXPIRATION_DURATION,
  } = fetchPolicyMiddlewareOptions || {};

  return next => async (req) => {
    const fetchPolicyInReq =
      (req.variables && req.variables.options && req.variables.options.fetchPolicy)
      || req.spec.requestContract.fetchPolicy;
    const requestFetchPolicy =
      getFetchPolicy(req.spec.specType, fetchPolicyInReq, fetchPolicy);

    const isStoreSecondaryPolicy = IsStoreSecondaryPolicy(requestFetchPolicy);
    let dataInStore = null;
    const isNetworkPolicy = IsNetworkPolicy(requestFetchPolicy);
    const isStorePolicy = IsStorePolicy(requestFetchPolicy);

    const currentTimestamp = Date.now();
    const isForceNetwork = shouldForceNetwork({
      store: req.store,
      spec: req.spec,
      dataRefId: req.dataRefId,
      variables: _.omit(req.variables, 'options'),
      storeExpirationDuration: cacheExpirationDuration,
      currentTimestamp,
      requestFetchPolicy,
    });

    if (isStorePolicy && !isForceNetwork && !isStoreSecondaryPolicy) {
      dataInStore = getDataFromStore(req.store, req.spec, req.dataRefId);
      if (!_.isEmpty(dataInStore)) {
        req.middlewareStates.isResponseFromStore = true;
        return dataInStore;
      }
    }

    if (isNetworkPolicy) {
      const res = await next(req)
        .then((response) => {
          updateDataRefStatus({
            store: req.store,
            spec: req.spec,
            dataRefId: req.dataRefId,
            variables: _.omit(req.variables, 'options'),
            currentTimestamp,
          });
          return response;
        })
        .catch((error) => {
          // we only try roll back to previous data if policy is networkOrStore
          // if policy is storeOrNetwork and we go here, it means we already miss the cache
          // or we decided to not trust the cache.
          if (requestFetchPolicy === FetchPolicy.NetworkOrStore) {
            dataInStore = getDataFromStore(req.store, req.spec, req.dataRefId);
            if (!_.isEmpty(dataInStore)) {
              req.middlewareStates.isResponseFromStore = true;
              return dataInStore;
            }
          }
          throw error;
        });
      return res;
    }

    return next(req);
  };
}
