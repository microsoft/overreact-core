/**
 * the Entity Data Model module
 */
const typesPlugin = require('./types-plugin');
const schemaPlugin = require('./schema-plugin');

class EDM {
  constructor(options) {
    typesPlugin(this);
    if (options) {
      schemaPlugin(this, options);
    }
  }
}

module.exports = {
  EDM,
};
