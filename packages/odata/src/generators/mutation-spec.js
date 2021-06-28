const {
  createRequestContract,
  createSpec,
  requestVerbs,
  FetchPolicy,
  specTypes,
} = require('@microsoft/overreact');

const {
  createUriFactory,
  odataHeaderFactory,
  odataPayloadFactory,
  createODataResponseContract,
} = require('./shared-entity');

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
function generateMutationSpec(edmModel, schema, path, visitedSchemas, entitySchema, isColl) {
  const requestContract = createODataRequestContract(edmModel,
    schema, path, visitedSchemas, isColl);
  const responseContract = createODataResponseContract(requestContract, entitySchema, isColl);

  return createSpec(requestContract, responseContract, specTypes.MUTATION, null);
}

module.exports = {
  generateMutationSpec,
};
