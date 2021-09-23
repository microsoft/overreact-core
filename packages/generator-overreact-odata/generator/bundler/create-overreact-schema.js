const { Schema } = require('@microsoft/overreact');

function createOverreactSchema(edmModel, nameMapper, extensions) {
  let schemaToModelMapping = {
    ...extensions,
  };

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const schemaName in edmModel.schema.schemas) {
    const mappedName = nameMapper(schemaName);
    if (mappedName && !schemaToModelMapping[mappedName]) {
      schemaToModelMapping = {
        ...schemaToModelMapping,
        [mappedName]: schemaName,
      };
    }
  }

  const schema = new Schema(schemaToModelMapping, name => edmModel.schema.schemas[name]);

  return schema;
}

module.exports = {
  createOverreactSchema,
};
