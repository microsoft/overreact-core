const { pathJoin } = require('../utils/path-join');

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

  const edmLocation = pathJoin(envRelativePath, 'edm');
  const envLocation = pathJoin(envRelativePath, 'env-instance');
  const schemaLocation = pathJoin(envRelativePath, 'schema');

  const odataUriSegments = odataUriFactory(visitedSchemas, aliasHashMap, !isDestroy);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap);

  function getRequestKeySelector(schema) {
    const { $$ODataExtension: { Key: extensionKey, BaseType } } = schema;

    if (extensionKey) {
      return extensionKey[0];
    }

    // look for a base type
    if (BaseType) {
      return getRequestKeySelector(BaseType.schema);
    }

    return null;
  }

  const requestKeySelector = getRequestKeySelector(rootSchema.schema);

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
    key: requestKeySelector,
    keySelector,
    parentKey,
  };
}

function writeCollSpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);
  const sharedContextForDestroy = composeSharedContext(metadata, scope, aliasHashMap, true);

  context.fs.copyTpl(
    context.templatePath(pathJoin('coll', 'add-spec.ejs')),
    pathJoin(destDir, 'coll', 'add-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'coll', 'add-decorators.js');

  context.fs.copyTpl(
    context.templatePath(pathJoin('coll', 'fetch-spec.ejs')),
    pathJoin(destDir, 'coll', 'fetch-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'coll', 'fetch-decorators.js');

  context.fs.copyTpl(
    context.templatePath(pathJoin('coll', 'destroy-spec.ejs')),
    pathJoin(destDir, 'coll', 'destroy-spec.js'),
    {
      dataPath,
      ...sharedContextForDestroy,
    },
  );

  writeDecorator(context, destDir, 'coll', 'destroy-decorators.js');

  context.fs.copyTpl(
    context.templatePath(pathJoin('coll', 'mutation-spec.ejs')),
    pathJoin(destDir, 'coll', 'mutation-spec.js'),
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
