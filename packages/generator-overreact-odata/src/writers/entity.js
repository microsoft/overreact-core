const path = require('path');

const {
  specMetadataScope,
} = require('@microsoft/overreact-odata');

const {
  odataUriFactory,
  generateDescriptorList,
} = require('../utils/uri-factory');

function composeSharedContext(metadata, scope) {
  const {
    schemaNameMapper, visitedSchemas, rootSchema,
  } = metadata;

  // calculate edm.js location
  const edmLocation = path.join(
    ...Array(visitedSchemas.length + 3).fill('..'),
    'env', 'edm',
  );

  const odataUri = odataUriFactory(visitedSchemas, schemaNameMapper, false);
  const descriptorList = generateDescriptorList(visitedSchemas, schemaNameMapper, false);
  const { $$ODataExtension } = rootSchema;

  return {
    edmLocation,
    descriptorList,
    odataUri,
    key: $$ODataExtension.Key[0],
  };
}

function writeEntitySpec(context, dataPath, metadata, scope, destDir) {
  const sharedContext = composeSharedContext(metadata, scope);

  context.fs.copyTpl(
    context.templatePath(path.join('entity', 'fetch-spec.ejs')),
    path.join(destDir, 'entity', 'fetch-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('entity', 'destroy-spec.ejs')),
    path.join(destDir, 'entity', 'destroy-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('entity', 'mutation-spec.ejs')),
    path.join(destDir, 'entity', 'mutation-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );
}

module.exports = {
  writeEntitySpec,
};
