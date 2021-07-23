const path = require('path');

const {
  specMetadataScope,
} = require('@microsoft/overreact-odata');

const {
  odataUriFactory,
  generateDescriptorList,
} = require('../utils/uri-factory');

function composeSharedContext(metadata, scope, aliasHashMap) {
  const {
    visitedSchemas, rootSchema,
  } = metadata;

  // calculate edm.js location
  const edmLocation = path.join(
    ...Array(visitedSchemas.length + 3).fill('..'),
    'env', 'edm',
  );

  const envLocation = path.join(
    ...Array(visitedSchemas.length + 3).fill('..'),
    'env', 'env-instance',
  );

  const odataUri = odataUriFactory(visitedSchemas, aliasHashMap, false);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap, false);
  const { $$ODataExtension } = rootSchema.schema;

  return {
    edmLocation,
    envLocation,
    descriptorList,
    odataUri,
    key: $$ODataExtension.Key[0],
  };
}

function writeEntitySpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope, config } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

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
