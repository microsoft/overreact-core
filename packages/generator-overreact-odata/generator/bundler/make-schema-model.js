const { generateODataSchema } = require('../schema/generate-odata-schema');
const { exportSchemaModel } = require('../schema/export-schema-model');

async function makeSchemaModel(url) {
  const namespaces = await generateODataSchema(url, {
    isByDefaultNullable(ref) {
      if (ref === 'Edm/String') {
        return true;
      }

      return !ref.startsWith('Edm') && !ref.startsWith('Enum');
    },
    withEnumValue: false,
  });

  const model = exportSchemaModel(namespaces);

  Object.keys(model || {}).forEach(key => {
    Object.assign(model[key], { $$ref: key });
  });

  return model;
}

module.exports = {
  makeSchemaModel,
};
