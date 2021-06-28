const {
  createRequestContract,
  createSpec,
  requestVerbs,
  specTypes,
} = require('@microsoft/overreact');

const {
  createUriFactory,
  odataHeaderFactory,
  createODataResponseContract,
} = require('./shared-entity');

function createODataRequestContract(edmModel, schema, path, visitedSchemas, isColl) {
  return createRequestContract({
    schema,
    dataPath: path,
    verb: requestVerbs.GET,
    uriFactoryFn: createUriFactory(edmModel, visitedSchemas, isColl),
    headerFactoryFn: odataHeaderFactory,
  });
}
function generateFetchSpec(edmModel, schema, path, visitedSchemas, entitySchema, isColl) {
  const requestContract = createODataRequestContract(edmModel,
    schema, path, visitedSchemas, isColl);
  const responseContract = createODataResponseContract(requestContract, entitySchema, isColl);

  return createSpec(requestContract, responseContract, specTypes.FETCH, null);
}

module.exports = {
  generateFetchSpec,
};
