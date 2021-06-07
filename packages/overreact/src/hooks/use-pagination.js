import _ from 'underscore';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import { useEnvironment } from '../environment';
import { getDataNode, createDataNode, getRecords, getDataRef, getRecordsById, updateDataRefWithIds } from '../store';
import { OVERREACT_ID_FIELD_NAME } from '../store/consts';
import { OverreactRequest } from './overreact-request';
import { getMergedConfig } from './merge-config';
import { getLookupCacheFn } from './helper';
import { getCacheIds } from './lookup-cache';

const getRecordsDataInDataRef = (store, requestContract, dataRefId) => {
  const records = getRecords(store, requestContract, dataRefId);

  return records && records.map(record => record.getData());
};

const getRawData = data => data && _.map(data, d => _.omit(d, OVERREACT_ID_FIELD_NAME));

const getRecordsDataById = (store, requestContract, ids) => {
  const records = getRecordsById(store, requestContract, ids);
  return records && records.map(record => record.getData());
};

export function usePagination(dataRefId, spec, config) {
  const {
    fetchVariables,
    strictMode = false,
    mergeNewRecords,
    lookupCacheByVariables,
  } = config;
  const refId = useRef(dataRefId);
  const { requestContract, environmentLookupFn } = spec;

  const cursorIndex = useRef(0);
  const loadingId = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const environment = useEnvironment(environmentLookupFn);

  const [data, setData] = useState(undefined);
  const [error, setError] = useState(undefined);

  const resetInternalState = useCallback(() => {
    loadingId.current = null;
    setIsLoading(false);
    cursorIndex.current = 0;
  }, []);

  if (refId.current !== dataRefId) {
    refId.current = dataRefId;
    resetInternalState();
  }

  const setInternalStateOnResponse = useCallback((records) => {
    cursorIndex.current = records.length;
  }, []);

  // using registerRequest to fire request, we cannot get the total count
  // so we set it to true for now
  const hasMore = useCallback(() => true, []);

  const loadMoreCallback = useCallback((__, updatedIds, request) => {
    loadingId.current = null;
    setIsLoading(false);

    const { store } = environment;
    const recordsData = getRecordsDataInDataRef(store, requestContract, dataRefId);
    const rawData = getRawData(recordsData);
    const dataRef = getDataRef(store, requestContract, dataRefId);
    dataRef.clearError();
    setInternalStateOnResponse(rawData);
    setData(rawData);

    const {
      onComplete,
    } = (request && request.mergedConfig) || {};

    if (onComplete) {
      onComplete(rawData);
    }
  }, [dataRefId, environment, requestContract, setData, setInternalStateOnResponse]);

  const onErrorCallback = useCallback((__, err, request) => {
    if (environment) {
      const { store } = environment;

      const dataRef = getDataRef(store, requestContract, dataRefId);
      const {
        status: {
          error: currentError,
        } = {},
      } = dataRef;

      if (currentError) {
        loadingId.current = null;
        setIsLoading(false);
      }
      setError(currentError);

      const {
        onError,
      } = (request && request.mergedConfig) || {};

      if (onError && !_.isUndefined(err)) {
        onError(err);
      }
    }
  }, [dataRefId, environment, requestContract]);

  const onEntitiesCreated = useCallback((dataRef, newIds) => {
    if (_.isFunction(mergeNewRecords)) {
      const { store } = environment;
      const records = getRecordsDataInDataRef(store, requestContract, dataRefId);
      const newRecords = getRecordsDataById(store, requestContract, newIds);
      const recordsToShow = mergeNewRecords(records, newRecords);
      const ids = recordsToShow.map(record => record[OVERREACT_ID_FIELD_NAME]);

      dataRef.reset(ids);
    }
  }, [dataRefId, environment, mergeNewRecords, requestContract]);

  const dataObserver = useMemo(() => ({
    update: loadMoreCallback,
    onError: onErrorCallback,
    onEntitiesCreated,
  }), [loadMoreCallback, onEntitiesCreated, onErrorCallback]);

  useEffect(() => {
    if (environment) {
      const schemaNode = requestContract.getSchemaNode();
      const { store } = environment;
      const dataNode = getDataNode(schemaNode) || createDataNode(schemaNode, store);
      const dataRef = dataNode.getDataRef(dataRefId);
      dataRef.subscribe(dataObserver);

      return () => dataRef.unsubscribe(dataObserver);
    }
    return () => {};
  }, [dataObserver, dataRefId, environment, requestContract]);

  const loadMore = useCallback((requestConfig) => {
    if (loadingId.current) {
      return;
    }

    if (!environment) {
      return;
    }
    const { pageSize } = fetchVariables;
    const { store } = environment;
    const recordsData = getRecordsDataInDataRef(store, requestContract, dataRefId);
    const rawData = getRawData(recordsData);

    if (rawData && rawData.length >= cursorIndex.current + pageSize) {
      cursorIndex.current = rawData.length;
      setData(rawData);
      return;
    }

    const lookupFn = getLookupCacheFn(lookupCacheByVariables, spec, requestContract.fetchPolicy);

    if (_.isFunction(lookupFn)) {
      try {
        const overreactIds = getCacheIds({
          store,
          requestContract,
          variables: fetchVariables,
          lookupFn,
        });

        if (!_.isEmpty(overreactIds)) {
          const dataRef = getDataRef(store, requestContract, dataRefId);

          updateDataRefWithIds(dataRef, overreactIds);

          return;
        }
      } catch (err) {
        // TODO: log error and send request
      }
    }

    const requestVars = {
      ...fetchVariables,
      cursorIndex: strictMode
        ? cursorIndex.current - (cursorIndex.current % pageSize)
        : cursorIndex.current,
    };

    const myId = _.uniqueId();

    loadingId.current = myId;
    setIsLoading(true);

    const mergedConfig = getMergedConfig(requestConfig, config);
    const request = new OverreactRequest({
      id: dataRefId,
      requestContract,
      spec,
      variables: requestVars,
      data: null,
      mergedConfig,
    });
    environment.pushRequest(request);
  }, [
    config,
    dataRefId,
    environment,
    fetchVariables,
    lookupCacheByVariables,
    requestContract,
    spec,
    strictMode,
  ]);

  const ret = useMemo(() => [{ data, error }, {
    isLoading,
    hasMore,
    loadMore,
  }], [data, error, hasMore, isLoading, loadMore]);

  return ret;
}
