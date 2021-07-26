const { EDM } = require('./src/edm/core');
const { resIdsPlugin } = require('./src/edm/resource-identifiers');
const { defineConstProperty } = require('./src/edm/reflection');

const { useODataCall } = require('./src/hooks/use-odata-call');
const { useODataCollection } = require('./src/hooks/use-odata-coll');
const { useODataEntity } = require('./src/hooks/use-odata-entity');

module.exports = {
  EDM,
  resIdsPlugin,
  defineConstProperty,

  useODataCall,
  useODataCollection,
  useODataEntity,
};
