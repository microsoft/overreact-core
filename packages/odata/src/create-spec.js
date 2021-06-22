import {
  Schema,
} from '@microsoft/overreact';
import {
  generateActionSpec,
  generateFuncSpec,
  generateFetchSpec,
  generateMutationSpec,
  generateDestroySpec,
  generateAddSpec,
} from './generators';

export function createOverreactSchema(edmModel, nameMapper, extensions) {
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

const generatedSpecs = {};

function createSpecForAction(
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

    generatedSpecs[callPath] = {
      actionSpec: generateActionSpec(edmModel, overreactSchema, callPath, visited, action, isColl),
    };
  }
}

function createSpecForFunction(
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
    generatedSpecs[callPath] = {
      funcSpec: generateFuncSpec(edmModel, overreactSchema, callPath, visited, func, isColl),
    };
  }
}

export function createSpec(
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

  generatedSpecs[path] = {
    entitySpecs: {
      fetch:
        generateFetchSpec(edmModel, overreactSchema, path, visitedSchemas, rootSchema, false),

      mutation:
        generateMutationSpec(edmModel, overreactSchema, path, visitedSchemas, rootSchema, false),

      destroy:
        generateDestroySpec(edmModel, overreactSchema, path, visitedSchemas, rootSchema, false),
    },
    collSpecs: {
      fetch:
        generateFetchSpec(edmModel, overreactSchema, path, visitedSchemas, rootSchema, true),

      mutation:
        generateMutationSpec(edmModel, overreactSchema, path, visitedSchemas, rootSchema, true),

      destroy:
        generateDestroySpec(edmModel, overreactSchema, path, visitedSchemas, rootSchema, true),

      add:
        generateAddSpec(edmModel, overreactSchema, path, visitedSchemas, rootSchema, true),
    },
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
          createSpec(
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
    createSpecForAction(
      edmModel,
      overreactSchema,
      schemaNameMapper,
      visitedSchemas,
      CollAction,
      true,
    );
    createSpecForFunction(
      edmModel,
      overreactSchema,
      schemaNameMapper,
      visitedSchemas,
      CollFunc,
      true,
    );
  }

  // Actions
  createSpecForAction(edmModel, overreactSchema, schemaNameMapper, visitedSchemas, ODataAction);

  // Functions
  createSpecForFunction(edmModel, overreactSchema, schemaNameMapper, visitedSchemas, ODataFunction);

  return generatedSpecs;
}
