const { generateODataSchema } = require('./schema/generate-odata-schema');
const { exportSchemaModel } = require('./schema/export-schema-model');
const { EDM } = require('./edm/core');
const { resIdsPlugin } = require('./edm/resource-identifiers');
const { defineConstProperty } = require('./edm/reflection');

const {
  createSpecMetadata,
  createOverreactSchema,

  specMetadataScope,
  specMetadataType,
} = require('./bundler/create-spec-metadata');

const { generatePath } = require('./bundler/path-generator');

const { schemaNameMapper } = require('./bundler/utils');

const { createSpecList } = require('./bundler/create-spec-list');

function makeSpecMetadataWithList(model, config, list) {

}

module.exports = {
  createSpecList,

  specMetadataScope,
  specMetadataType,
};
