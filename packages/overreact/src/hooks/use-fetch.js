import _ from 'underscore';
import {
  useRef, useReducer, useCallback, useMemo, useEffect,
} from 'react';
import { useEnvironment } from '../environment';
import { useDeepEqualEffect } from './use-deep-equal-effect';
import {
  getDataNode, createDataNode, getRecords, getDataRef, getRecordsById, updateDataRefWithIds,
} from '../store';
import { OverreactRequest } from './overreact-request';
import { getCacheIds } from './lookup-cache';
import { getDataFromRecords, getLookupCacheFn } from './helper';

export function equalityFn(newData, oldData) {
  return _.isEqual(newData, oldData);
}

export function useFetch(dataRefId, spec, variables, config) {
  const {
    requestContract,
    responseContract,
    environmentLookupFn,
  } = spec;

  const requestRequired = useRef(true);
  const currentData = useRef(undefined);
  const currentError = useRef(undefined);

  const [, forceRender] = useReducer(x => x + 1, 0);

  const environment = useEnvironment(environmentLookupFn);
  const { postponeRead, lookupCacheByVariables } = config || {};
  const lookupFn = useMemo(
    () => getLookupCacheFn(lookupCacheByVariables, spec, requestContract.fetchPolicy),
    [lookupCacheByVariables, requestContract.fetchPolicy, spec],
  );

  // TODO: dataCallback shall take a param, which is a set of
  // overreact IDs, to efficiently compare data and force render
  const dataCallback = useCallback(() => {
    // fetch data from store
    if (environment) {
      const { store } = environment;

      const records = getRecords(store, requestContract, dataRefId);

      if (records) {
        const data = getDataFromRecords(records, responseContract);
        if (equalityFn(data, currentData.current)) {
          return;
        }

        currentData.current = data;

        forceRender();
      }
    }
  }, [dataRefId, environment, requestContract, responseContract]);

  const errorCallback = useCallback(() => {
    if (environment) {
      const { store } = environment;

      const dataRef = getDataRef(store, requestContract, dataRefId);
      const {
        status: {
          error,
        } = {},
      } = dataRef;

      if (equalityFn(error, currentError.current)) {
        return;
      }

      currentError.current = error;
      forceRender();
    }
  }, [dataRefId, environment, requestContract]);

  const dataObserver = useMemo(() => ({
    update: dataCallback,
    onError: errorCallback,
  }), [dataCallback, errorCallback]);

  useEffect(() => {
    if (environment) {
      const schemaNode = requestContract.getSchemaNode();
      const { store } = environment;
      const dataNode = getDataNode(schemaNode) || createDataNode(schemaNode, store);
      const dataRef = dataNode.getDataRef(dataRefId);
      dataRef.subscribe(dataObserver);

      return () => dataRef.unsubscribe(dataObserver);
    }
    return _.noop;
  }, [dataObserver, dataRefId, environment, requestContract]);

  useEffect(() => {
    if (environment && !currentData.current && _.isFunction(lookupFn)) {
      const schemaNode = requestContract.getSchemaNode();
      const { store } = environment;
      const dataNode = getDataNode(schemaNode) || createDataNode(schemaNode, store);
      const dataRef = dataNode.getDataRef(dataRefId);

      try {
        const overreactIds = getCacheIds({
          store,
          requestContract,
          variables,
          lookupFn,
        });

        if (!_.isEmpty(overreactIds)) {
          updateDataRefWithIds(dataRef, overreactIds);
          const records = getRecordsById(store, requestContract, overreactIds);
          currentData.current = getDataFromRecords(records, responseContract);
          requestRequired.current = false;
          forceRender();
        }
      } catch (error) {
        // TODO: log error and send request
      }
    }
  // we only try hit cache once when environment is ready
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  useDeepEqualEffect(() => {
    if (requestRequired.current && environment) {
      if (!postponeRead) {
        const request = new OverreactRequest({
          id: dataRefId,
          requestContract,
          spec,
          variables,
          data: null,
        });
        environment.pushRequest(request);
      }
      requestRequired.current = false;
    }
    // TODO: need to unregister this request
  }, [dataCallback, environment, requestContract, spec, variables]);

  return [currentData.current, currentError.current];
}
