const { schemaNameMapper } = require('./utils');
const { makeEdmModel } = require('./make-edm-model');
const { createOverreactSchema } = require('./create-spec-metadata');
const { generatePath } = require('./path-generator');

function createModelAliasHash(modelAliases) {
  // because modelAliases' keys are aliases, we convert the object
  // to another object, with its keys being the model names, and
  // corresponding values being an array of given aliases.
  const hash = {};

  Object.entries(modelAliases).forEach(([k, v]) => {
    if (!hash[v]) {
      hash[v] = [];
    }

    hash[v].push(k);
  });

  return hash;
}

// Create a spec (data path) list from a known model aliases
function createSpecList(model, config) {
  const {
    modelAliases,
    rootPropertyModelName,
    rootPropertyName,
  } = config;

  const edm = makeEdmModel(model, config);
  const overreactSchema = createOverreactSchema(edm, schemaNameMapper, modelAliases);
  const aliasHashMap = createModelAliasHash(modelAliases);

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
