import _ from 'underscore';
import stringify from 'json-stable-stringify';

import { getRecords, getDataRef } from '../../store';
import { specTypes } from '../../spec/spec-types';
import { responseTypes } from '../../spec/response-types';

export const DEFAULT_STORE_EXPIRATION_DURATION = 5 * 60 * 1000;

export const FetchPolicy = {
  StoreOnly: 'StoreOnly',
  NetworkOnly: 'NetworkOnly',
  StoreOrNetwork: 'StoreOrNetwork',
  NetworkOrStore: 'NetworkOrStore',
};

export function IsNetworkPolicy(fetchPolicy) {
  return fetchPolicy === FetchPolicy.NetworkOnly
    || fetchPolicy === FetchPolicy.NetworkOrStore
    || fetchPolicy === FetchPolicy.StoreOrNetwork;
}

export function IsStorePolicy(fetchPolicy) {
  return fetchPolicy === FetchPolicy.StoreOnly
    || fetchPolicy === FetchPolicy.StoreOrNetwork
    || fetchPolicy === FetchPolicy.NetworkOrStore;
}

export function IsStoreSecondaryPolicy(fetchPolicy) {
  return fetchPolicy === FetchPolicy.NetworkOrStore;
}

export function getFetchPolicy(specType, fetchPolicyOption, fetchPolicyInEnv) {
  if (specType === specTypes.FETCH
    || specType === specTypes.PAGINATION
    || fetchPolicyOption !== FetchPolicy.StoreOnly) {
    return fetchPolicyOption || fetchPolicyInEnv;
  }

  return fetchPolicyInEnv;
}

export function getDataFromStore(store, spec, dataRefId) {
  const { requestContract } = spec;
  const records = getRecords(store, requestContract, dataRefId);

  const dataInStore = _.map(records, record => record.getData());
  if (spec.responseContract.responseType === responseTypes.ENTITY
    && !_.isEmpty(dataInStore) && _.isArray(dataInStore)) {
    return dataInStore[0];
  }
  return dataInStore;
}

export function shouldForceNetwork({
  store, spec, dataRefId, variables, storeExpirationDuration, currentTimestamp, requestFetchPolicy,
}) {
  const { requestContract } = spec;
  const dataRef = getDataRef(store, requestContract, dataRefId);
  const {
    status: {
      previousVariables,
      lastUpdateTimestamp,
    } = {},
  } = dataRef || {};
  return requestFetchPolicy !== FetchPolicy.StoreOnly
    && (stringify(variables) !== stringify(previousVariables)
    || currentTimestamp - lastUpdateTimestamp > storeExpirationDuration);
}

export function updateDataRefStatus({
  store, spec, dataRefId, variables, currentTimestamp,
}) {
  const { requestContract } = spec;
  const dataRef = getDataRef(store, requestContract, dataRefId);
  if (dataRef) {
    dataRef.updateStatus({
      previousVariables: variables,
      lastUpdateTimestamp: currentTimestamp,
    });
  }
}
