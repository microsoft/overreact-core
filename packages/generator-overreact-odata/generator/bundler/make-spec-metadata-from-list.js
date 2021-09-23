const pluralize = require('pluralize');

const { specMetadataType, specMetadataScope } = require('./consts');
const { snakeToPascalCase, pascalToSnakeCase } = require('./utils');

function makeVisitedSchemas(rootSchema, dataPathSegments) {
  const visitedSchemas = [rootSchema];
  let lastVisited = rootSchema;

  // each data path segment is in the form of singluar, snake-cased names
  // find the model behind each segment and construct visited schema from them
  dataPathSegments.forEach(seg => {
    const {
      schema: {
        $$ODataExtension: {
          NavigationProperty,
        },
        properties,
      },
    } = lastVisited;

    if (NavigationProperty) {
      NavigationProperty.every(navPropertyName => {
        const segmentName = pascalToSnakeCase(pluralize.singular(navPropertyName));
        if (segmentName === seg) {
          const property = properties[navPropertyName];
          const { items: { schema } } = property;

          lastVisited = {
            name: navPropertyName,
            schema,
          };
          visitedSchemas.push(lastVisited);
          return false;
        }

        return true;
      });
    }
  });

  return visitedSchemas;
}

// Creates spec metadata from a list of spec data paths
function makeSpecMetadataFromList(model, config) {
  const {
    rootPropertyModelName,
    rootPropertyName,
    specList,
  } = config;

  const specMetadata = {};
  Object.entries(specList).forEach(([dataPath, configObj]) => {
    specMetadata[dataPath] = [];
    configObj.forEach(cfg => {
      const { type: configType } = cfg;

      const dataPathSegments = dataPath.split(':');

      let specType = specMetadataType.MODEL;
      let specScope = specMetadataScope.ENTITY;
      if (configType === 'coll') {
        specScope = specMetadataScope.COLL;
      }

      let callName = null;
      if (configType === 'call') {
        // the last segment of the data path would be the call name
        // which is simply converted using the pascal-to-snake conversion,
        // we'll need to revert it back to pascal casing.
        callName = snakeToPascalCase(dataPathSegments.pop());
      }

      const visitedSchemas = makeVisitedSchemas(
        {
          name: rootPropertyName,
          schema: model[rootPropertyModelName],
        },
        dataPathSegments.slice(1),
      );

      const lastModelSchema = visitedSchemas[visitedSchemas.length - 1];

      let rootSchema = lastModelSchema;

      if (configType === 'call') {
        // look for the call object in the last model schema object
        const {
          schema: {
            $$ODataExtension: {
              Function: ODataFunction,
              Action: ODataAction,
              Collection,
            },
          },
        } = rootSchema;

        rootSchema = {};

        // CAVEAT: We'll simply use namespace from $$ODataExtension
        if (ODataAction) {
          const fullName = `${ODataAction[Object.keys(ODataAction)[0]].Namespace}.${callName}`;
          rootSchema = {
            name: fullName,
            schema: ODataAction[fullName],
          };
          if (rootSchema.schema) {
            specType = specMetadataType.ACTION;
          }
        }
        if (!rootSchema.schema && ODataFunction) {
          const fullName = `${ODataFunction[Object.keys(ODataFunction)[0]].Namespace}.${callName}`;
          rootSchema = {
            name: fullName,
            schema: ODataFunction[fullName],
          };
          if (rootSchema.schema) {
            specType = specMetadataType.FUNC;
          }
        }

        if (!rootSchema.schema && Collection) {
          const { Action: CollAction, Function: CollFunc } = Collection;
          if (CollAction) {
            const fullName = `${CollAction[Object.keys(CollAction)[0]].Namespace}.${callName}`;
            rootSchema = {
              name: fullName,
              schema: CollAction[fullName],
            };
            if (rootSchema.schema) {
              specType = specMetadataType.ACTION;
              specScope = specMetadataScope.COLL;
            }
          }
          if (!rootSchema.schema && CollFunc) {
            const fullName = `${CollFunc[Object.keys(CollFunc)[0]].Namespace}.${callName}`;
            rootSchema = {
              name: fullName,
              schema: CollFunc[fullName],
            };
            if (rootSchema.schema) {
              specType = specMetadataType.FUNC;
              specScope = specMetadataScope.COLL;
            }
          }
        }
      }

      specMetadata[dataPath].push({
        type: specType,
        scope: specScope,
        metadata: {
          path: dataPath,
          visitedSchemas,
          rootSchema,
          config: cfg,
        },
      });
    });
  });

  return specMetadata;
}

module.exports = {
  makeSpecMetadataFromList,
};
