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
  const odataUri = odataUriFactory(visitedSchemas, schemaNameMapper, false);
  const descriptorList = generateDescriptorList(visitedSchemas, schemaNameMapper, false);
  const { $$ODataExtension } = rootSchema;

  return {
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
      edmLocation: './edm',
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'fetch-spec.ejs')),
    path.join(destDir, 'coll', 'fetch-spec.js'),
    {
      edmLocation: './edm',
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'destroy-spec.ejs')),
    path.join(destDir, 'coll', 'destroy-spec.js'),
    {
      edmLocation: './edm',
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'mutation-spec.ejs')),
    path.join(destDir, 'coll', 'mutation-spec.js'),
    {
      edmLocation: './edm',
      dataPath,
      ...sharedContext,
    },
  );
}

module.exports = {
  writeCollSpec,
};
