import _ from 'underscore';
import { useCallback } from 'react';
import { useEnvironment } from '../environment';
import { FetchPolicy } from '../middleware';
import { getRecords, getDataRef, updateDataRefWithIds } from '../store';
import { OverreactRequest } from './overreact-request';
import { getMergedConfig } from './merge-config';
import { getCacheIds } from './lookup-cache';
import { getDataFromRecords, getLookupCacheFn } from './helper';

export function useRefetch(dataRefId, spec, config) {
  const {
    requestContract,
    responseContract,
    environmentLookupFn,
  } = spec;
  const environment = useEnvironment(environmentLookupFn);

  const dataCallback = useCallback((dataItems, request) => {
    if (environment) {
      const {
        onComplete,
      } = (request && request.mergedConfig) || {};

      const { store } = environment;
      const records = getRecords(store, requestContract, dataRefId);
      const data = getDataFromRecords(records, responseContract);

      if (onComplete) {
        onComplete(data);
      }
    }
  }, [dataRefId, environment, requestContract, responseContract]);

  const errorCallback = useCallback((error, request) => {
    const {
      onError = _.noop,
    } = (request && request.mergedConfig) || {};
    onError(error);
  }, []);

  const refetchFn = useCallback((parameter, ...rest) => {
    if (environment) {
      const { store } = environment;
      const requestConfig = rest.slice(-1)[0];
      const mergedConfig = getMergedConfig(requestConfig, config);
      const { lookupCacheByVariables } = mergedConfig;

      const {
        variables,
        payload,
      } = parameter;
      const { options: { fetchPolicy: fetchPolicyInReq } = {} } = variables || {};

      const fetchPolicy = fetchPolicyInReq
        || requestContract.fetchPolicy || FetchPolicy.NetworkOnly;

      const request = new OverreactRequest({
        id: dataRefId,
        requestContract,
        spec,
        variables,
        data: payload,
        dataCb: dataCallback,
        errorCb: errorCallback,
        mergedConfig,
      });

      const lookupFn = getLookupCacheFn(lookupCacheByVariables, spec, fetchPolicy);

      if (_.isFunction(lookupFn)) {
        try {
          const overreactIds = getCacheIds({
            store,
            requestContract,
            variables,
            lookupFn,
          });

          if (!_.isEmpty(overreactIds)) {
            const dataRef = getDataRef(store, requestContract, dataRefId);

            updateDataRefWithIds(dataRef, overreactIds);

            const records = getRecords(store, requestContract, dataRefId);
            const data = getDataFromRecords(records, responseContract);

            dataCallback(data, request);

            return;
          }
        } catch (error) {
          // TODO: log error and send request
        }
      }
      environment.pushRequest(request);
    }
  }, [
    config,
    dataCallback,
    dataRefId,
    environment,
    errorCallback,
    requestContract,
    responseContract,
    spec,
  ]);

  return refetchFn;
}
