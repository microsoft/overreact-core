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
  odataPayloadFactory,
} from './shared-call';

function createODataRequestContract(edmModel, schema, path, visitedSchemas, isColl) {
  return createRequestContract({
    schema,
    dataPath: path,
    verb: requestVerbs.POST,
    uriFactoryFn: createUriFactory(edmModel, visitedSchemas, isColl),
    headerFactoryFn: odataHeaderFactory,
    payloadFactoryFn: odataPayloadFactory,
  });
}

export function generateActionSpec(edmModel, schema, path, visitedSchemas, action, isColl) {
  const requestContract = createODataRequestContract(edmModel,
    schema, path, visitedSchemas, isColl);
  const responseContract = createODataResponseContract(requestContract, action, isColl);

  return createSpec(requestContract, responseContract, specTypes.FETCH, null);
}
