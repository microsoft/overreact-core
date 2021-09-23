const { pathJoin } = require('../utils/path-join');

const { specMetadataScope } = require('../bundler/consts');

const {
  odataCallUriFactory,
  generateDescriptorList,
} = require('../utils/uri-factory');

const { buildEnvRelativePath } = require('./env');
const { writeDecorator } = require('./decorator');

function composeSharedContext(metadata, scope, aliasHashMap) {
  const {
    visitedSchemas, rootSchema,
  } = metadata;

  // calculate edm.js location
  const envRelativePath = buildEnvRelativePath(visitedSchemas.length + 1);

  const edmLocation = pathJoin(envRelativePath, 'edm');
  const envLocation = pathJoin(envRelativePath, 'env-instance');
  const schemaLocation = pathJoin(envRelativePath, 'schema');

  const isColl = scope === specMetadataScope.COLL;

  const odataUriSegments = odataCallUriFactory(visitedSchemas, rootSchema, aliasHashMap, isColl);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap);

  // note that for action/function, the "parent" is the _last_
  // element of the descriptor list

  const parentKey = descriptorList.length > 1
    ? descriptorList[descriptorList.length - 2]
    : descriptorList[0];
  const keySelector = descriptorList.length > 0
    ? descriptorList[descriptorList.length - 1]
    : descriptorList[0];

  const { ReturnType } = rootSchema.schema;
  let responseType = 'responseTypes.ENTITY';
  let key = 'r => r';
  let processor = 'r => r';

  if (ReturnType) {
    const { type, items, schema } = ReturnType;
    if (type === 'array') {
      responseType = 'responseTypes.COLL';
      processor = 'r => r.values';

      if (items.schema) {
        // complex collection type
        if (items.schema.$$ODataExtension.Key) {
          key = `r => r.${items.schema.$$ODataExtension.Key[0]}`;
        } else if (items.schema.properties.Id) {
          key = 'r => r.Id';
        }
      }
    } else if (schema) {
      // complex entity
      if (schema.$$ODataExtension.Key) {
        key = `${schema.$$ODataExtension.Key[0]}`;
      }
    }
  }

  return {
    edmLocation,
    envLocation,
    schemaLocation,
    descriptorList,
    odataUriSegments,
    key,
    responseType,
    processor,
    parentKey,
    keySelector,
    isColl,
  };
}

function writeActionSpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

  context.fs.copyTpl(
    context.templatePath(pathJoin('calls', 'action-spec.ejs')),
    pathJoin(destDir, 'calls', 'action-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'calls', 'action-decorators.js');
}

function writeFuncSpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

  context.fs.copyTpl(
    context.templatePath(pathJoin('calls', 'func-spec.ejs')),
    pathJoin(destDir, 'calls', 'func-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeDecorator(context, destDir, 'calls', 'func-decorators.js');
}

module.exports = {
  writeActionSpec,
  writeFuncSpec,
};
