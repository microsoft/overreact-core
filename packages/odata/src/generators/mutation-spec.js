import {
  createRequestContract,
  createSpec,
  requestVerbs,
  FetchPolicy,
  specTypes,
} from '@microsoft/overreact';

import {
  createUriFactory,
  odataHeaderFactory,
  odataPayloadFactory,
  createODataResponseContract,
} from './shared-entity';

function createODataRequestContract(edmModel, schema, path, visitedSchemas, isColl) {
  return createRequestContract({
    schema,
    dataPath: path,
    verb: requestVerbs.PATCH,
    uriFactoryFn: createUriFactory(edmModel, visitedSchemas, isColl),
    headerFactoryFn: odataHeaderFactory,
    payloadFactoryFn: odataPayloadFactory,
    fetchPolicy: FetchPolicy.NetworkOrStore,
  });
}
export function generateMutationSpec(edmModel, schema, path, visitedSchemas, entitySchema, isColl) {
  const requestContract = createODataRequestContract(edmModel,
    schema, path, visitedSchemas, isColl);
  const responseContract = createODataResponseContract(requestContract, entitySchema, isColl);

  return createSpec(requestContract, responseContract, specTypes.MUTATION, null);
}
