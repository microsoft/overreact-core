const {
  EDM,
  resIdsPlugin,
  defineConstProperty,
} = require('@microsoft/overreact-odata');

function makeEdmModel(model, config) {
  const {
    rootPropertyName,
    rootPropertyModelName,
    // schemaExtensions,
  } = config;

  const edm = new EDM({
    schemas: {
      $ROOT: {
        $$ref: '$ROOT',
        type: 'object',
        properties: {
          [rootPropertyName]: {
            type: 'array',
            items: model[rootPropertyModelName],
          },
        },
        $$ODataExtension: {
          Name: '$ROOT',
          NavigationProperty: [
            rootPropertyName,
          ],
        },
      },
      ...model,
    },
  });

  resIdsPlugin(edm);

  const root = edm.types.resolve('$ROOT');

  const rootResourceIdentifier = new root.ResourceIdentifier();
  defineConstProperty(edm, 'root', rootResourceIdentifier);
  defineConstProperty(edm, rootPropertyName, rootResourceIdentifier[rootPropertyName]);

  return edm;
}

module.exports = {
  makeEdmModel,
};
