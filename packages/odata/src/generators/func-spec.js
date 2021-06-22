import {
  createRequestContract,
  createSpec,
  requestVerbs,
  specTypes,
} from '@microsoft/overreact';

import {
  createUriFactory,
  createODataResponseContract,
  odataHeaderFactory,
} from './shared-call';

function createODataRequestContract(edmModel, schema, path, visitedSchemas, isColl) {
  return createRequestContract({
    schema,
    dataPath: path,
    verb: requestVerbs.GET,
    uriFactoryFn: createUriFactory(edmModel, visitedSchemas, isColl),
    headerFactoryFn: odataHeaderFactory,
  });
}

export function generateFuncSpec(edmModel, schema, path, visitedSchemas, func, isColl) {
  const requestContract = createODataRequestContract(edmModel,
    schema, path, visitedSchemas, isColl);
  const responseContract = createODataResponseContract(requestContract, func, isColl);

  return createSpec(requestContract, responseContract, specTypes.FETCH, null);
}
