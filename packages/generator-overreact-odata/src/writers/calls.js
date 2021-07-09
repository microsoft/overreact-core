const path = require('path');

const {
  specMetadataScope,
} = require('@microsoft/overreact-odata');

const {
  odataCallUriFactory,
  generateDescriptorList,
} = require('../utils/uri-factory');

function composeSharedContext(metadata, scope) {
  const {
    schemaNameMapper, visitedSchemas, rootSchema,
  } = metadata;

  const isColl = scope === specMetadataScope.COLL;

  const odataUri = odataCallUriFactory(visitedSchemas, schemaNameMapper, isColl);
  const descriptorList = generateDescriptorList(visitedSchemas, schemaNameMapper, isColl, true);

  const { ReturnType } = rootSchema;
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
    descriptorList,
    odataUri,
    key,
    responseType,
    processor,
  };
}

function writeActionSpec(context, dataPath, metadata, scope, destDir) {
  const sharedContext = composeSharedContext(metadata, scope);

  context.fs.copyTpl(
    context.templatePath(path.join('calls', 'action-spec.ejs')),
    path.join(destDir, 'calls', 'action-spec.js'),
    {
      edmLocation: './edm',
      dataPath,
      ...sharedContext,
    },
  );
}

function writeFuncSpec(context, dataPath, metadata, scope, destDir) {
  const sharedContext = composeSharedContext(metadata, scope);

  context.fs.copyTpl(
    context.templatePath(path.join('calls', 'func-spec.ejs')),
    path.join(destDir, 'calls', 'func-spec.js'),
    {
      edmLocation: './edm',
      dataPath,
      ...sharedContext,
    },
  );
}

module.exports = {
  writeActionSpec,
  writeFuncSpec,
};
