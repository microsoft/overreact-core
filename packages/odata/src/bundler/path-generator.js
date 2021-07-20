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

function generatePathForCall(
  edmModel,
  overreactSchema,
  schemaNameMapper,
  visitedSchemas,
  calls,
  // isColl = false,
) {
  if (!calls) {
    return [];
  }

  const paths = [];
  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const callName in calls) {
    const call = calls[callName];
    const { Name } = call;

    const visited = [
      ...visitedSchemas,
      { name: Name, schema: call },
    ];

    const callPath = createPath(visited, schemaNameMapper);

    paths.push(callPath);
  }

  return paths;
}

function generatePath(
  edmModel,
  overreactSchema,
  rootSchema,
  schemaNameMapper,
  visitedSchemas,
) {
  let paths = [];

  const { schemas: edmSchemas } = edmModel.schema;

  const { $$ODataExtension, properties } = rootSchema;
  const {
    NavigationProperty,
    Function: ODataFunction,
    Action: ODataAction,
    Collection, // Action/Functions on collection
  } = $$ODataExtension;

  const path = createPath(visitedSchemas, schemaNameMapper);

  paths.push(path);

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
          const p = generatePath(
            edmModel,
            overreactSchema,
            schemaObj,
            schemaNameMapper,
            [
              ...visitedSchemas,
              { name: navPropertyName, schema: schemaObj },
            ],
          );

          paths = [
            ...paths,
            ...p,
          ];
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
      schemaNameMapper,
      visitedSchemas,
      CollAction,
      true,
    );
    const pf = generatePathForCall(
      edmModel,
      overreactSchema,
      schemaNameMapper,
      visitedSchemas,
      CollFunc,
      true,
    );

    paths = [
      ...paths,
      ...pa,
      ...pf,
    ];
  }

  // Actions
  const actionPaths = generatePathForCall(
    edmModel,
    overreactSchema,
    schemaNameMapper,
    visitedSchemas,
    ODataAction,
  );

  // Functions
  const funcPaths = generatePathForCall(
    edmModel,
    overreactSchema,
    schemaNameMapper,
    visitedSchemas,
    ODataFunction,
  );

  paths = [
    ...paths,
    ...actionPaths,
    ...funcPaths,
  ];

  return paths;
}

module.exports = {
  generatePath,
};
