const { makeEdmModel } = require('./make-edm-model');
const {
  createSpecMetadata,
  createOverreactSchema,
} = require('./create-spec-metadata');
const { schemaNameMapper } = require('./utils');

function makeSpecMetadata(model, config) {
  const {
    rootPropertyName,
    rootPropertyModelName,
    // schemaExtensions,
  } = config;

  const edm = makeEdmModel(model, config);

  const overreactSchema = createOverreactSchema(edm, schemaNameMapper, {
    // TODO: also needs to be customizable
    disapproved_campaign: 'Model/McaCampaign',
  });

  const specsMetadata = createSpecMetadata(
    edm,
    overreactSchema,
    model[rootPropertyModelName],
    schemaNameMapper,
    [{
      name: rootPropertyName,
      schema: model[rootPropertyModelName],
    }],
    {},
  );

  return specsMetadata;
}

module.exports = {
  makeSpecMetadata,
};
