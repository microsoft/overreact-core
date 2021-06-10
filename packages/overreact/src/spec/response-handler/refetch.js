import { getDataNode, createDataNode } from '../../store';
import { responseTypes } from '../response-types';
import { OVERREACT_ID_FIELD_NAME } from '../../store/consts';
import { getSideEffectCacheStoreHelpers } from './sideEffectFnHelper';

export default function handler(environment, processedResponse, request) {
  return context => {
    const {
      id: dataRefId,
      variables,
      dataCb,
      spec,
    } = request;
    const { locator } = variables;
    const { store } = environment;

    let dataNode = getDataNode(context.schemaNode);

    if (!dataNode) {
      dataNode = createDataNode(context.schemaNode, store);
    }

    const dataRef = dataNode.getDataRef(dataRefId);
    dataRef.clear();

    const { descriptor, order } = locator;
    const { requestContract, sideEffectFn } = spec;
    const { parentKeySelector } = requestContract;
    let parentId = parentKeySelector ? parentKeySelector(variables) : undefined;
    let dataWithId = null;

    if (context.responseType === responseTypes.ENTITY) {
      if (!parentId && order.length > 1) {
        parentId = descriptor[order[order.length - 2]];
      }

      dataWithId = context.applyId(processedResponse, parentId);
      const overreactId = dataWithId[OVERREACT_ID_FIELD_NAME];

      dataRef.add(overreactId);

      store.getRecordGroup(context.schemaNode.modelName)
        .addOrUpdateRecords([dataWithId], request);

      dataCb(dataWithId, request);
    } else if (context.responseType === responseTypes.COLL) {
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

      dataCb(dataWithId, request);
    }

    if (sideEffectFn) {
      const cacheStoreHelper = getSideEffectCacheStoreHelpers(environment);
      sideEffectFn(dataWithId, request, spec, cacheStoreHelper);
    }
  };
}
