const { fetchMetadata } = require('./lib/fetchMetadata');
const { parseSchemas } = require('./lib/parseSchemas');

async function generateODataSchema(endpoint, {
  isByDefaultNullable = ref => {
    if (ref === 'Edm/String') {
      return true;
    }
    return !ref.startsWith('Edm');
  },
  withEnumValue = false,
} = {}) {
  const metadata = await fetchMetadata(endpoint);
  const odataSchemas = parseSchemas(metadata['edmx:Edmx']['edmx:DataServices'][0].Schema, {
    isByDefaultNullable,
    withEnumValue,
  });

  const namespaces = {};

  Object.entries(odataSchemas)
    .filter(([namespace, namespaceSchemas]) => !namespace.startsWith('http') && Object.getOwnPropertyNames(namespaceSchemas).length)
    .forEach(([namespace, namespaceSchemas]) => {
      namespaces[namespace] = namespaceSchemas;
    });

  return namespaces;
}

module.exports = {
  generateODataSchema,
};
