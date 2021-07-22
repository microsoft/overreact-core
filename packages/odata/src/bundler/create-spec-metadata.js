const { Schema } = require('@microsoft/overreact');

const { generateSpecMetadata } = require('../generators/spec-metadata');

const { specMetadataScope, specMetadataType } = require('./consts');

function createOverreactSchema(edmModel, nameMapper, extensions) {
  let schemaToModelMapping = {
    ...extensions,
  };

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const schemaName in edmModel.schema.schemas) {
    const mappedName = nameMapper(schemaName);
    if (mappedName && !schemaToModelMapping[mappedName]) {
      schemaToModelMapping = {
        ...schemaToModelMapping,
        [mappedName]: schemaName,
      };
    }
  }

  const schema = new Schema(schemaToModelMapping, name => edmModel.schema.schemas[name]);

  return schema;
}

function createPath(visited, nameMapper) {
  return visited.map(seg => {
    const { $$ref, Name } = seg.schema;
    if ($$ref) {
      return nameMapper($$ref);
    }

    if (Name) {
      return nameMapper(Name);
    }

    return '';
  }).join(':');
}

const specMetadata = {};

function createSpecMetadataForAction(
  edmModel,
  overreactSchema,
  schemaNameMapper,
  visitedSchemas,
  actions,
  isColl = false,
) {
  if (!actions) {
    return;
  }

  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const actionName in actions) {
    const action = actions[actionName];
    const { Name } = action;

    const visited = [
      ...visitedSchemas,
      { name: Name, schema: action },
    ];

    const callPath = createPath(visited, schemaNameMapper);

    specMetadata[callPath] = {
      type: specMetadataType.ACTION,
      scope: isColl ? specMetadataScope.COLL : specMetadataScope.ENTITY,
      metadata: generateSpecMetadata(
        edmModel,
        overreactSchema,
        schemaNameMapper,
        callPath,
        visited,
        action,
      ),
    };
  }
}

function createSpecMetadataForFunction(
  edmModel,
  overreactSchema,
  schemaNameMapper,
  visitedSchemas,
  functions,
  isColl = false,
) {
  if (!functions) {
    return;
  }

  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const functionName in functions) {
    const func = functions[functionName];
    const { Name } = func;

    const visited = [
      ...visitedSchemas,
      { name: Name, schema: func },
    ];

    const callPath = createPath(visited, schemaNameMapper);

    // create spec for function (GET)
    specMetadata[callPath] = {
      type: specMetadataType.FUNC,
      scope: isColl ? specMetadataScope.COLL : specMetadataScope.ENTITY,
      metadata: generateSpecMetadata(
        edmModel,
        overreactSchema,
        schemaNameMapper,
        callPath,
        visited,
        func,
      ),
    };
  }
}

function createSpecMetadata(
  edmModel,
  overreactSchema,
  rootSchema,
  schemaNameMapper,
  visitedSchemas,
  extensions = {},
) {
  const { schemas: edmSchemas } = edmModel.schema;

  const { $$ODataExtension, properties } = rootSchema;
  const {
    NavigationProperty,
    Function: ODataFunction,
    Action: ODataAction,
    Collection, // Action/Functions on collection
  } = $$ODataExtension;

  const path = createPath(visitedSchemas, schemaNameMapper);

  specMetadata[path] = {
    type: specMetadataType.MODEL,
    metadata: generateSpecMetadata(
      edmModel,
      overreactSchema,
      schemaNameMapper,
      path,
      visitedSchemas,
      rootSchema,
    ),
  };

  // Handle navigation properties
  if (NavigationProperty) {
    NavigationProperty.forEach(navPropertyName => {
      const property = properties[navPropertyName];
      const { type } = property;

      if (type === 'array') {
        const { $ref, schema } = property.items;
        let schemaObj = schema;

        if (!schemaObj) {
          // some metadata doesn't include schema node,
          // try to locate one from schema collection instead
          schemaObj = edmSchemas[$ref];
        }

        if (!visitedSchemas.find(p => p.name === navPropertyName)) {
          createSpecMetadata(
            edmModel,
            overreactSchema,
            schemaObj,
            schemaNameMapper,
            [
              ...visitedSchemas,
              { name: navPropertyName, schema: schemaObj },
            ],
            extensions,
          );
        }
      } else {
        console.log('UNHANDLED', property);
      }
    });
  }

  if (Collection) {
    const { Action: CollAction, Function: CollFunc } = Collection;
    createSpecMetadataForAction(
      edmModel,
      overreactSchema,
      schemaNameMapper,
      visitedSchemas,
      CollAction,
      true,
    );
    createSpecMetadataForFunction(
      edmModel,
      overreactSchema,
      schemaNameMapper,
      visitedSchemas,
      CollFunc,
      true,
    );
  }

  // Actions
  createSpecMetadataForAction(
    edmModel,
    overreactSchema,
    schemaNameMapper,
    visitedSchemas, ODataAction,
  );

  // Functions
  createSpecMetadataForFunction(
    edmModel,
    overreactSchema,
    schemaNameMapper,
    visitedSchemas,
    ODataFunction,
  );

  return specMetadata;
}

module.exports = {
  createOverreactSchema,
  createSpecMetadata,
  specMetadataScope,
  specMetadataType,
};
