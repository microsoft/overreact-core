const path = require('path');

const {
  odataUriFactory,
  generateDescriptorList,
} = require('../utils/uri-factory');

const { buildEnvRelativePath } = require('./env');
const { writeDecorator } = require('./decorator');

function composeSharedContext(metadata, scope, aliasHashMap, isDestroy = false) {
  const {
    visitedSchemas, rootSchema,
  } = metadata;

  // calculate edm.js location
  const envRelativePath = buildEnvRelativePath(visitedSchemas.length);

  const edmLocation = path.join(envRelativePath, 'edm');
  const envLocation = path.join(envRelativePath, 'env-instance');
  const schemaLocation = path.join(envRelativePath, 'schema');

  const odataUriSegments = odataUriFactory(visitedSchemas, aliasHashMap, !isDestroy);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap);
  const { $$ODataExtension } = rootSchema.schema;

  const keySelector = descriptorList.length > 0
    ? descriptorList[descriptorList.length - 1]
    : descriptorList[0];

  const parentKey = descriptorList.length > 1
    ? descriptorList[descriptorList.length - 2]
    : descriptorList[0];

  // we'll need to remove the last element in descriptorList to avoid eslint issue
  if (!isDestroy) {
    descriptorList.pop();
  }

  return {
    edmLocation,
    envLocation,
    schemaLocation,
    descriptorList,
    odataUriSegments,
    key: $$ODataExtension.Key[0],
    keySelector,
    parentKey,
  };
}

function writeCollSpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);
  const sharedContextForDestroy = composeSharedContext(metadata, scope, aliasHashMap, true);

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'add-spec.ejs')),
    path.join(destDir, 'coll', 'add-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'coll', 'add-decorators.js');

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'fetch-spec.ejs')),
    path.join(destDir, 'coll', 'fetch-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'coll', 'fetch-decorators.js');

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'destroy-spec.ejs')),
    path.join(destDir, 'coll', 'destroy-spec.js'),
    {
      dataPath,
      ...sharedContextForDestroy,
    },
  );

  writeDecorator(context, destDir, 'coll', 'destroy-decorators.js');

  context.fs.copyTpl(
    context.templatePath(path.join('coll', 'mutation-spec.ejs')),
    path.join(destDir, 'coll', 'mutation-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'coll', 'mutation-decorators.js');
}

module.exports = {
  writeCollSpec,
};
