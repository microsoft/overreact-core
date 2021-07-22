const {
  specMetadataScope,
  specMetadataType,
} = require('./src/bundler/consts');

const { makeSchemaModel } = require('./src/bundler/make-schema-model');
const { makeSpecMetadata } = require('./src/bundler/make-spec-metadata');
const { createSpecList } = require('./src/bundler/create-spec-list');

module.exports = {
  makeSpecMetadata,
  makeSchemaModel,
  createSpecList,

  specMetadataScope,
  specMetadataType,
};
