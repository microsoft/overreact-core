import _ from 'underscore';
import { getDataNode, createDataNode } from '../../store';
import { responseTypes } from '../response-types';
import { OVERREACT_ID_FIELD_NAME } from '../../store/consts';
import { getSideEffectCacheStoreHelpers } from './sideEffectFnHelper';

export default function handler(environment, processedResponse, request) {
  return context => {
    const { id: dataRefId, variables, spec } = request;
    const { locator } = variables;

    const { store } = environment;

    let dataNode = getDataNode(context.schemaNode);

    if (!dataNode) {
      dataNode = createDataNode(context.schemaNode, store);
    }

    const dataRef = dataNode.getDataRef(dataRefId);
    dataRef.clearError();

    const { descriptor, order } = locator;
    const { requestContract, sideEffectFn } = spec;
    const { parentKeySelector } = requestContract;
    let parentId = parentKeySelector ? parentKeySelector(variables) : undefined;
    let dataWithId = null;

    // after the response has been processed, it will either be
    //   - a single entity
    //   - an array of entities
    if (context.responseType === responseTypes.ENTITY) {
      if (!parentId && order.length > 1) {
        parentId = descriptor[order[order.length - 2]];
      }

      // step 1 - generate _overreact_id
      dataWithId = context.applyId(processedResponse, parentId);
      const overreactId = dataWithId[OVERREACT_ID_FIELD_NAME];

      // step 2 - add/merge _overreact_id to current dataRef
      dataRef.add(overreactId);

      // step 3 - insert the data into store, this will trigger callbacks
      // in data nodes, which will in turn trigger dataRef refresh.
      store.getRecordGroup(context.schemaNode.modelName)
        .addOrUpdateRecords([dataWithId], request);
    } else if (context.responseType === responseTypes.COLL) {
      // when requests for COLL, the parentId is the last element in the locator
      if (!parentId && order.length > 0) {
        parentId = descriptor[order[order.length - 1]];
      }
      dataWithId = processedResponse.map(entity => {
        const data = context.applyId(entity, parentId);
        const overreactId = data[OVERREACT_ID_FIELD_NAME];

        dataRef.add(overreactId);

        return data;
      });

      store.getRecordGroup(context.schemaNode.modelName)
        .addOrUpdateRecords(dataWithId, request);

      // when the return value is empty, we still need to notify the hook who trigger this call
      if (dataWithId.length === 0) {
        dataRef.notify('update', [], request);
      }
    }

    if (sideEffectFn && !_.isEmpty(dataWithId)) {
      const cacheStoreHelper = getSideEffectCacheStoreHelpers(environment);
      sideEffectFn(dataWithId, request, spec, cacheStoreHelper);
    }
  };
}
