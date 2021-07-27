const pluralize = require('pluralize');
const { snakeToPascalCase, pascalToSnakeCase } = require('./utils');

const usedHookNames = {};
function composePath(visited, isCall = false) {
  const paths = {};

  function createConfigObj(pathName) {
    const pathNames = pathName.split(':');
    let hookName = '';
    for (let i = pathNames.length - 1; i >= 0; i -= 1) {
      hookName = `${snakeToPascalCase(pathNames[i])}${hookName}`;
      if (!usedHookNames[hookName]) {
        // not used
        usedHookNames[hookName] = 1;
        break;
      }
    }

    if (isCall) {
      return [{
        type: 'call',
        name: `use${hookName}`,
      }];
    }

    return [{
      type: 'entity',
      name: `use${hookName}`,
    }, {
      type: 'coll',
      name: `use${pluralize(hookName)}`,
    }];
  }

  function expandPath(depth, path) {
    if (depth === visited.length) {
      // remove the leading ":"
      const pathName = path.slice(1);

      const configObj = createConfigObj(pathName, isCall);

      paths[pathName] = configObj;
      return;
    }

    const { name: navigationName } = visited[depth];

    let segmentName = pascalToSnakeCase(pluralize.singular(navigationName));
    if (isCall && depth === visited.length - 1) {
      segmentName = pascalToSnakeCase(navigationName);
    }

    expandPath(depth + 1, `${path}:${segmentName}`);
  }

  expandPath(0, '');

  return paths;
}

function composePathForCall(visitedSchemas, calls) {
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

    const callPath = composePath(visited, true);

    paths = { ...paths, ...callPath };
  }

  return paths;
}

function generatePath(
  edmModel,
  rootPropertyName,
  rootSchema,
) {
  let paths = {};

  function producePath(visited) {
    const lastVisitedSchema = visited[visited.length - 1];

    const path = composePath(visited);

    paths = { ...paths, ...path };

    const { $$ODataExtension } = lastVisitedSchema.schema;
    const {
      Function: ODataFunction,
      Action: ODataAction,
      Collection, // Action/Functions on collection
    } = $$ODataExtension;

    if (Collection) {
      const { Action: CollAction, Function: CollFunc } = Collection;
      const pa = composePathForCall(visited, CollAction);
      const pf = composePathForCall(visited, CollFunc);

      paths = { ...paths, ...pa, ...pf };
    }

    // Actions
    const actionPaths = composePathForCall(visited, ODataAction);

    // Functions
    const funcPaths = composePathForCall(visited, ODataFunction);

    paths = { ...paths, ...actionPaths, ...funcPaths };
  }

  function searchPaths() {
    const searched = [[{
      name: rootPropertyName,
      schema: rootSchema,
    }]];

    let start = 0;

    const { schemas: edmSchemas } = edmModel.schema;

    while (start < searched.length) {
      const visited = searched[start];
      start += 1;

      // TODO: process visited
      producePath(visited);

      const lastVisitedSchema = visited[visited.length - 1];
      const { $$ODataExtension, properties } = lastVisitedSchema.schema;
      const { NavigationProperty } = $$ODataExtension;

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

            if (!visited.find(p => p.name === navPropertyName)) {
              searched.push([
                ...visited,
                {
                  name: navPropertyName,
                  schema: schemaObj,
                },
              ]);
            }
          } else {
            console.log('UNHANDLED', property);
          }
        });
      }
    }
  }

  searchPaths();

  return paths;
}

module.exports = {
  generatePath,
};
