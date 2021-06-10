import { responseTypes } from '../response-types';
import { specTypes } from '../spec-types';
import { getSideEffectCacheStoreHelpers } from './sideEffectFnHelper';

export default function handler(environment, processedResponse, request) {
  return context => {
    const { variables, dataCb, spec } = request;
    const { locator } = variables;
    const { requestContract, sideEffectFn } = spec;
    const { parentKeySelector } = requestContract;
    let parentId = parentKeySelector ? parentKeySelector(variables) : undefined;
    let dataWithId = null;

    const { descriptor, order } = locator;
    if (context.responseType === responseTypes.COLL || request.spec.specType === specTypes.ADD) {
      // when requests for COLL or create entity, the parentId is the last element in the locator
      if (!parentId && order.length > 0) {
        parentId = descriptor[order[order.length - 1]];
      }
      const responseArr = Array.isArray(processedResponse)
        ? processedResponse
        : [processedResponse];
      dataWithId = responseArr.map(entity => context.applyId(entity, parentId));

      dataCb(dataWithId, request);
    } else if (context.responseType === responseTypes.ENTITY) {
      if (!parentId && order.length > 1) {
        parentId = descriptor[order[order.length - 2]];
      }

      // step 1 - generate _overreact_id
      dataWithId = context.applyId(processedResponse, parentId);

      dataCb([dataWithId], request);
    } else if (context.responseType === responseTypes.NONE) {
      // TODO: we need to deal with DELETE
      dataCb(null, request);
    }

    if (sideEffectFn) {
      const cacheStoreHelper = getSideEffectCacheStoreHelpers(environment);
      sideEffectFn(dataWithId, request, spec, cacheStoreHelper);
    }
  };
}
