const { EDM } = require('./core');
const { resIdsPlugin } = require('./resource-identifiers');
const { defineConstProperty } = require('./reflection');

module.exports = {
  EDM,
  resIdsPlugin,
  defineConstProperty,
};
