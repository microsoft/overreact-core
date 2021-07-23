const path = require('path');

const {
  specMetadataScope,
} = require('@microsoft/overreact-odata');

const {
  odataCallUriFactory,
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

  const isColl = scope === specMetadataScope.COLL;

  const odataUri = odataCallUriFactory(visitedSchemas, aliasHashMap, isColl);
  const descriptorList = generateDescriptorList(visitedSchemas, aliasHashMap, isColl, true);

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
    descriptorList,
    odataUri,
    key,
    responseType,
    processor,
  };
}

function writeActionSpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope, config } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

  context.fs.copyTpl(
    context.templatePath(path.join('calls', 'action-spec.ejs')),
    path.join(destDir, 'calls', 'action-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );
}

function writeFuncSpec(context, dataPath, spec, aliasHashMap, destDir) {
  const { metadata, scope, config } = spec;
  const sharedContext = composeSharedContext(metadata, scope, aliasHashMap);

  context.fs.copyTpl(
    context.templatePath(path.join('calls', 'func-spec.ejs')),
    path.join(destDir, 'calls', 'func-spec.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );
}

module.exports = {
  writeActionSpec,
  writeFuncSpec,
};
