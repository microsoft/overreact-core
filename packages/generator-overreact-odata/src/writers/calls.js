const path = require('path');

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

  const edmLocation = path.join(envRelativePath, 'edm');
  const envLocation = path.join(envRelativePath, 'env-instance');
  const schemaLocation = path.join(envRelativePath, 'schema');

  const isColl = scope === specMetadataScope.COLL;

  const odataUriSegments = odataCallUriFactory(visitedSchemas, rootSchema, aliasHashMap, isColl);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap, isColl);

  // note that for action/function, the "parent" is the _last_
  // element of the descriptor list
  const parentKey = descriptorList[descriptorList.length - 1];

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
  };
}

function writeActionSpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

  context.fs.copyTpl(
    context.templatePath(path.join('calls', 'action-spec.ejs')),
    path.join(destDir, 'calls', 'action-spec.js'),
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
    context.templatePath(path.join('calls', 'func-spec.ejs')),
    path.join(destDir, 'calls', 'func-spec.js'),
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
