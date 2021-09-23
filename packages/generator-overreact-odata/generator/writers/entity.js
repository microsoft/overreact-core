const { pathJoin } = require('../utils/path-join');

const {
  odataUriFactory,
  generateDescriptorList,
} = require('../utils/uri-factory');

const { buildEnvRelativePath } = require('./env');
const { writeDecorator } = require('./decorator');

function composeSharedContext(metadata, scope, aliasHashMap) {
  const {
    visitedSchemas, rootSchema,
  } = metadata;

  // calculate edm.js location
  const envRelativePath = buildEnvRelativePath(visitedSchemas.length);

  const edmLocation = pathJoin(envRelativePath, 'edm');
  const envLocation = pathJoin(envRelativePath, 'env-instance');
  const schemaLocation = pathJoin(envRelativePath, 'schema');

  const odataUriSegments = odataUriFactory(visitedSchemas, aliasHashMap, false);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap);
  const { $$ODataExtension } = rootSchema.schema;

  const keySelector = descriptorList.length > 0
    ? descriptorList[descriptorList.length - 1]
    : descriptorList[0];

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
    keySelector,
    parentKey,
  };
}

function writeEntitySpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

  context.fs.copyTpl(
    context.templatePath(pathJoin('entity', 'fetch-spec.ejs')),
    pathJoin(destDir, 'entity', 'fetch-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'entity', 'fetch-decorators.js');

  context.fs.copyTpl(
    context.templatePath(pathJoin('entity', 'destroy-spec.ejs')),
    pathJoin(destDir, 'entity', 'destroy-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'entity', 'destroy-decorators.js');

  context.fs.copyTpl(
    context.templatePath(pathJoin('entity', 'mutation-spec.ejs')),
    pathJoin(destDir, 'entity', 'mutation-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'entity', 'mutation-decorators.js');
}

module.exports = {
  writeEntitySpec,
};
