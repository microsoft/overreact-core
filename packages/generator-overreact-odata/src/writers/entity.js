const path = require('path');

const {
  odataUriFactory,
  generateDescriptorList,
} = require('../utils/uri-factory');

const { buildEnvRelativePath } = require('./env');

function composeSharedContext(metadata, scope, aliasHashMap) {
  const {
    visitedSchemas, rootSchema,
  } = metadata;

  // calculate edm.js location
  const envRelativePath = buildEnvRelativePath(visitedSchemas.length);

  const edmLocation = path.join(envRelativePath, 'edm');
  const envLocation = path.join(envRelativePath, 'env-instance');
  const schemaLocation = path.join(envRelativePath, 'schema');

  const odataUriSegments = odataUriFactory(visitedSchemas, aliasHashMap, false);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap, false);
  const { $$ODataExtension } = rootSchema.schema;

  const parentKey = descriptorList.length > 1
    ? descriptorList[descriptorList.length - 2]
    : descriptorList[0];

  return {
    edmLocation,
    envLocation,
    schemaLocation,
    descriptorList,
    odataUriSegments,
    key: $$ODataExtension.Key[0],
    parentKey,
  };
}

function writeEntitySpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

  context.fs.copyTpl(
    context.templatePath(path.join('entity', 'fetch-spec.ejs')),
    path.join(destDir, 'entity', 'fetch-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copy(
    context.templatePath(path.join('shared', 'decorators.js')),
    path.join(destDir, 'entity', 'fetch-decorators.js'),
  );

  context.fs.copyTpl(
    context.templatePath(path.join('entity', 'destroy-spec.ejs')),
    path.join(destDir, 'entity', 'destroy-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copy(
    context.templatePath(path.join('shared', 'decorators.js')),
    path.join(destDir, 'entity', 'destroy-decorators.js'),
  );

  context.fs.copyTpl(
    context.templatePath(path.join('entity', 'mutation-spec.ejs')),
    path.join(destDir, 'entity', 'mutation-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  context.fs.copy(
    context.templatePath(path.join('shared', 'decorators.js')),
    path.join(destDir, 'entity', 'mutation-decorators.js'),
  );
}

module.exports = {
  writeEntitySpec,
};
