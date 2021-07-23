const { schemaNameMapper } = require('./utils');
const { makeEdmModel } = require('./make-edm-model');
const { createOverreactSchema } = require('./create-spec-metadata');
const { generatePath } = require('./path-generator');

// Create a spec (data path) list from a known model aliases
function createSpecList(model, aliasHashMap, config) {
  const {
    modelAliases,
    rootPropertyModelName,
    rootPropertyName,
  } = config;

  const edm = makeEdmModel(model, config);
  const overreactSchema = createOverreactSchema(edm, schemaNameMapper, modelAliases);

  return generatePath(
    edm,
    overreactSchema,
    aliasHashMap,
    model[rootPropertyModelName],
    schemaNameMapper,
    [{
      name: rootPropertyName,
      schema: model[rootPropertyModelName],
    }],
  );
}

module.exports = {
  createSpecList,
};
