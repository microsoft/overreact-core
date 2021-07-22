const { createConfigObj } = require('./config-obj');

function composePath(visited, aliasHashMap, nameMapper, isCall = false) {
  const paths = {};

  function expandPath(depth, path) {
    if (depth === visited.length) {
      // remove the leading ":"
      const pathName = path.slice(1);

      const configObj = createConfigObj(pathName, isCall);

      paths[pathName] = configObj;
      return;
    }

    const { $$ref, Name } = visited[depth].schema;

    const modelName = $$ref || Name || '';

    if (aliasHashMap[modelName]) {
      aliasHashMap[modelName].forEach(alias => {
        expandPath(depth + 1, `${path}:${alias}`);
      });
    } else {
      expandPath(depth + 1, `${path}:${nameMapper(modelName)}`);
    }
  }

  expandPath(0, '');

  return paths;
}

function generatePathForCall(
  edmModel,
  overreactSchema,
  aliasHashMap,
  schemaNameMapper,
  visitedSchemas,
  calls,
  // isColl = false,
) {
  if (!calls) {
    return {};
  }

  let paths = {};
  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const callName in calls) {
    const call = calls[callName];
    const { Name } = call;

    const visited = [
      ...visitedSchemas,
      { name: Name, schema: call },
    ];

    const callPath = composePath(visited, aliasHashMap, schemaNameMapper, true);

    paths = {
      ...paths,
      ...callPath,
    };
  }

  return paths;
}

function generatePath(
  edmModel,
  overreactSchema,
  aliasHashMap,
  rootSchema,
  schemaNameMapper,
  visitedSchemas,
) {
  let paths = {};

  const { schemas: edmSchemas } = edmModel.schema;

  const { $$ODataExtension, properties } = rootSchema;
  const {
    NavigationProperty,
    Function: ODataFunction,
    Action: ODataAction,
    Collection, // Action/Functions on collection
  } = $$ODataExtension;

  const path = composePath(visitedSchemas, aliasHashMap, schemaNameMapper);

  paths = {
    ...paths,
    ...path,
  };

  if (NavigationProperty) {
    NavigationProperty.forEach(navPropertyName => {
      const property = properties[navPropertyName];
      const { type } = property;

      if (type === 'array') {
        const { $ref, schema } = property.items;

        if (!aliasHashMap[$ref]) {
          // not in alias hash map - ignore this property
          return;
        }

        let schemaObj = schema;

        if (!schemaObj) {
          // some metadata doesn't include schema node,
          // try to locate one from schema collection instead
          schemaObj = edmSchemas[$ref];
        }

        if (!visitedSchemas.find(p => p.name === navPropertyName)) {
          const p = generatePath(
            edmModel,
            overreactSchema,
            aliasHashMap,
            schemaObj,
            schemaNameMapper,
            [
              ...visitedSchemas,
              { name: navPropertyName, schema: schemaObj },
            ],
          );

          paths = {
            ...paths,
            ...p,
          };
        }
      } else {
        console.log('UNHANDLED', property);
      }
    });
  }

  if (Collection) {
    const { Action: CollAction, Function: CollFunc } = Collection;
    const pa = generatePathForCall(
      edmModel,
      overreactSchema,
      aliasHashMap,
      schemaNameMapper,
      visitedSchemas,
      CollAction,
      true,
    );
    const pf = generatePathForCall(
      edmModel,
      overreactSchema,
      aliasHashMap,
      schemaNameMapper,
      visitedSchemas,
      CollFunc,
      true,
    );

    paths = {
      ...paths,
      ...pa,
      ...pf,
    };
  }

  // Actions
  const actionPaths = generatePathForCall(
    edmModel,
    overreactSchema,
    aliasHashMap,
    schemaNameMapper,
    visitedSchemas,
    ODataAction,
  );

  // Functions
  const funcPaths = generatePathForCall(
    edmModel,
    overreactSchema,
    aliasHashMap,
    schemaNameMapper,
    visitedSchemas,
    ODataFunction,
  );

  paths = {
    ...paths,
    ...actionPaths,
    ...funcPaths,
  };

  return paths;
}

module.exports = {
  generatePath,
};
