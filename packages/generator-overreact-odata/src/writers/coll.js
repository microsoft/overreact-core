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

  const odataUri = odataUriFactory(visitedSchemas, schemaNameMapper, true);
  const descriptorList = generateDescriptorList(visitedSchemas, schemaNameMapper, true);
  const { $$ODataExtension } = rootSchema;

  return {
    edmLocation,
    descriptorList,
    odataUri,
    key: $$ODataExtension.Key[0],
  };
}

function writeCollSpec(context, dataPath, metadata, scope, destDir) {
  const sharedContext = composeSharedContext(metadata, scope);

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'add-spec.ejs')),
    path.join(destDir, 'coll', 'add-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'fetch-spec.ejs')),
    path.join(destDir, 'coll', 'fetch-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'destroy-spec.ejs')),
    path.join(destDir, 'coll', 'destroy-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'mutation-spec.ejs')),
    path.join(destDir, 'coll', 'mutation-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );
}

module.exports = {
  writeCollSpec,
};
