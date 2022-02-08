import _ from 'underscore';
import { useCallback, useRef } from 'react';
import { useEnvironment } from '../environment';
import {
  getRecords, getDataRef, getRecordGroup, getRecordsByEntityKey,
} from '../store';
import { specTypes } from '../spec/spec-types';
import { OVERREACT_ID_FIELD_NAME } from '../store/consts';
import { responseTypes } from '../spec/response-types';
import { OverreactRequest } from './overreact-request';
import { getMergedConfig } from './merge-config';

import { useComponent } from './use-component';

const getRawData = data => data && _.map(data, d => d.rawData);

const getDataWithOverreactIdFromRecords = records => _.map(records, r => ({
  rawData: r.getData(),
  [OVERREACT_ID_FIELD_NAME]: r.id,
}));

function mutateRecords(
  store,
  requestContract,
  recordsBeforeMutation,
  newRecords,
) {
  if (store) {
    const recordGroup = getRecordGroup(store, requestContract);

    recordGroup.addOrUpdateRecords(recordsBeforeMutation);
    recordGroup.addOrUpdateRecords(newRecords);
  }
}

function addRecords(
  store,
  requestContract,
  records,
) {
  if (store && records && records.length > 0) {
    const recordGroup = getRecordGroup(store, requestContract);
    recordGroup.addOrUpdateRecords(records);
    const ids = records.map(record => record[OVERREACT_ID_FIELD_NAME]);

    // notify hooks, so that they can adjust the refIds accordingly
    recordGroup.notify('entitiesCreated', ids);
  }
}

function deleteRecords(store, requestContract, records = []) {
  if (store) {
    const recordGroup = getRecordGroup(store, requestContract);
    const ids = records.map(record => record[OVERREACT_ID_FIELD_NAME]);

    recordGroup.deleteRecords(ids);
    recordGroup.notify('entitiesDeleted', ids);
  }
}

function addPreemptiveRecords(store, requestContract, request, records) {
  if (store) {
    store.addPreemptiveRecords(request, records);
    addRecords(store, requestContract, records);
  }
}

function replacePreemptiveRecords(store, requestContract, request, records) {
  const preemptiveRecords = store.removePreemptiveRecords(request);
  deleteRecords(store, requestContract, preemptiveRecords);
  addRecords(store, requestContract, records);
}

function applyId(variables, spec, data, specType) {
  const { locator } = variables;
  const { requestContract, responseContract } = spec;
  const { parentKeySelector } = requestContract;
  let parentId = parentKeySelector ? parentKeySelector(variables) : undefined;

  const { descriptor, order } = locator;

  if (responseContract.responseType === responseTypes.COLL || specType === specTypes.ADD) {
    // when requests for COLL or create entity, the parentId is the last element in the locator
    if (!parentId && order.length > 0) {
      parentId = descriptor[order[order.length - 1]];
    }
    const dataArr = Array.isArray(data) ? data : [data];
    return dataArr.map(entity => responseContract.applyId(entity, parentId));
  }

  if (responseContract.responseType === responseTypes.ENTITY) {
    if (!parentId && order.length > 1) {
      parentId = descriptor[order[order.length - 2]];
    }

    // step 1 - generate _overreact_id
    return responseContract.applyId(data, parentId);
  }

  throw new Error('unknown response type, cannot apply id');
}

export function useMutation(dataRefId, spec, config) {
  // DEBUG ONLY
  const componentName = useComponent();

  const {
    requestContract,
    responseContract,
    specType,
    environmentLookupFn,
  } = spec;
  const recordsBeforeMutationRef = useRef();
  const environment = useEnvironment(environmentLookupFn);

  const dataCallback = useCallback((dataWithOverreactId, request) => {
    if (environment) {
      const { store } = environment;
      const dataRef = getDataRef(store, requestContract, dataRefId);
      dataRef.clearError();

      const {
        onComplete,
        preemptiveResponseFn,
      } = (request && request.mergedConfig) || {};

      if (preemptiveResponseFn) {
        if (specType === specTypes.MUTATION) {
          const recordsBeforeMutation = recordsBeforeMutationRef.current || [];
          const dataBeforeWithId = getDataWithOverreactIdFromRecords(recordsBeforeMutation);
          mutateRecords(
            store,
            requestContract,
            dataBeforeWithId,
            dataWithOverreactId,
          );
        } else if (specType === specTypes.ADD) {
          replacePreemptiveRecords(
            store,
            requestContract,
            request,
            dataWithOverreactId,
          );
        }
      } else if (specType === specTypes.ADD) {
        addRecords(store, requestContract, dataWithOverreactId);
      } else if (specType === specTypes.MUTATION) {
        mutateRecords(
          store,
          requestContract,
          [],
          dataWithOverreactId,
        );
      }

      if (specType === specTypes.DELETE) {
        const { data } = request;
        const dataArray = Array.isArray(data) ? data : [data];
        const { keySelector } = responseContract;
        const keys = dataArray.map(d => keySelector(d));
        const records = getRecordsByEntityKey(store, spec, keys);
        const dataWithId = getDataWithOverreactIdFromRecords(records);

        deleteRecords(store, requestContract, dataWithId);
      }

      const data = getRawData(dataWithOverreactId);

      if (onComplete) {
        onComplete(data);
      }
    }
  }, [dataRefId, environment, requestContract, responseContract, spec, specType]);

  const errorCallback = useCallback((error, request) => {
    if (environment) {
      const { store } = environment;
      const {
        onError,
        preemptiveResponseFn,
      } = (request && request.mergedConfig) || {};

      const recordsBeforeMutation = recordsBeforeMutationRef.current || [];
      const dataBeforeWithId = getDataWithOverreactIdFromRecords(recordsBeforeMutation);
      if (recordsBeforeMutationRef.current) {
        // revert change
        mutateRecords(
          store,
          requestContract,
          dataBeforeWithId,
          [],
        );
      }

      if (preemptiveResponseFn) {
        if (specType === specTypes.MUTATION) {
          mutateRecords(
            store,
            requestContract,
            dataBeforeWithId,
            [],
          );
        } else if (specType === specTypes.ADD) {
          replacePreemptiveRecords(
            store,
            requestContract,
            request,
            [],
          );
        }
      }

      if (onError) {
        onError(error);
      }
    }
  }, [environment, requestContract, specType]);

  const mutateFn = useCallback((variables, mutationData, ...rest) => {
    if (environment) {
      const { store } = environment;
      const requestConfig = rest.slice(-1)[0];
      const mergedConfig = getMergedConfig(requestConfig, config);
      const { preemptiveResponseFn } = mergedConfig;

      // stash current value. This will be useful when preemptive updates is enabled,
      // and we need to revert to original state before applying actual response from server.
      if (dataRefId) {
        const recordsBeforeMutation = getRecords(store, requestContract, dataRefId);
        if (recordsBeforeMutation) {
          recordsBeforeMutationRef.current = recordsBeforeMutation;
        }
      }

      const request = new OverreactRequest({
        id: dataRefId,
        requestContract,
        spec,
        variables,
        data: mutationData,
        dataCb: dataCallback,
        errorCb: errorCallback,
        mergedConfig,
        componentName,
      });

      // we can perform preemptive updates right now (before actual request)
      // the store will be reverted/merged with response in data callbacks - when the response
      // comes back.
      if (preemptiveResponseFn) {
        if (specType === specTypes.MUTATION) {
          const recordsBeforeMutation = recordsBeforeMutationRef.current || [];
          const dataBeforeWithId = getDataWithOverreactIdFromRecords(recordsBeforeMutation);
          const dataBefore = _.map(dataBeforeWithId, d => d.rawData);
          mutateRecords(
            store,
            requestContract,
            dataBeforeWithId,
            preemptiveResponseFn(dataBefore, mutationData),
          );
        } else if (specType === specTypes.ADD) {
          const data = preemptiveResponseFn(mutationData);
          const records = applyId(request.variables, spec, data, specType);
          addPreemptiveRecords(
            store,
            requestContract,
            request,
            records,
          );
        }
      }

      // Register the request to be issued - in this implementation the request will go to the
      // request queue in DataFetcher, waiting to be invoked. So one shall not assume
      // the request will go out immediately.
      environment.pushRequest(request);
    }
  // eslint-disable-next-line max-len
  }, [config, dataCallback, dataRefId, environment, errorCallback, requestContract, spec, specType, componentName]);

  return mutateFn;
}
