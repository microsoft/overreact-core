const {
  specMetadataScope,
  specMetadataType,
} = require('./src/bundler/consts');

const { makeSchemaModel } = require('./src/bundler/make-schema-model');
const { createSpecList } = require('./src/bundler/create-spec-list');
const { createModelAliasHash } = require('./src/bundler/create-model-alias-hash');
const { makeSpecMetadataFromList } = require('./src/bundler/make-spec-metadata-from-list');

module.exports = {
  makeSpecMetadataFromList,

  makeSchemaModel,
  createSpecList,
  createModelAliasHash,

  specMetadataScope,
  specMetadataType,
};
