/**
 * the schema plugin module
 */

const _ = require('underscore');
const { Registry } = require('./registry');
const {
  defineConstProperty,
  hasOwnProperty,
} = require('./reflection');

const typesPlugin = require('./types-plugin');

function getSchemaName(schema) {
  const { $$ODataExtension, name } = schema;
  if ($$ODataExtension) {
    return $$ODataExtension.Name;
  }

  // deprecated
  // There is no such keyword as "name" in JSON Schema, it's specific to OData
  // See:
  //  http://json-schema.org/latest/json-schema-core.html
  //  http://json-schema.org/latest/json-schema-validation.html
  return name;
}

function getSchemaBaseTypeName(schema) {
  const { $$ODataExtension, clrTypeBase } = schema;
  if ($$ODataExtension) {
    return $$ODataExtension.BaseType && $$ODataExtension.BaseType.$ref;
  }

  // deprecated
  // There is no such keyword as "clrTypeBase" in JSON Schema, it's specific to OData
  // See:
  //  http://json-schema.org/latest/json-schema-core.html
  //  http://json-schema.org/latest/json-schema-validation.html
  return clrTypeBase;
}

function getSchemaKey(schema) {
  const { $$ODataExtension, key } = schema;
  if ($$ODataExtension) {
    return $$ODataExtension.Key;
  }

  // deprecated
  // There is no such keyword as "key" in JSON Schema, it's specific to OData
  // See:
  //  http://json-schema.org/latest/json-schema-core.html
  //  http://json-schema.org/latest/json-schema-validation.html
  return key;
}

function getSchemaNavigationPropertyNames(schema) {
  const { $$ODataExtension } = schema;
  if ($$ODataExtension) {
    return $$ODataExtension.NavigationProperty;
  }

  return [];
}

module.exports = (edm, {
  schemas = {},
  // TODO: deprecated, every schemas should be able to have different namespaces
  // we are still using it with legacy schemas
  namespace = null,
} = {}) => {
  if (hasOwnProperty(edm, 'schema')) {
    return;
  }

  typesPlugin(edm);

  const {
    CollectionType,
    EntityType,
    PrimitiveType,
    ComplexType,
    OneOfType,
    ActionType,
    FunctionType,
  } = edm.types;

  defineConstProperty(edm, 'schema', (() => {
    function getSchemaFullName(schema, path) {
      // $$ref exists in resolved schema
      const possiblePath = (_.isString(path) && path) || schema.$$ref || schema.$ref;
      return possiblePath
        ? possiblePath.replace(/\//g, '.')
        : Registry.getQualifiedName(getSchemaName(schema), namespace);
    }

    /**
     * Get type name object with its information
     * @param {Schema[]} dependencies - An output paramter, a queue of dependent schemas
     * @param {Object} typeInfo - The schema information of the property
     * @return {String} The type name
     */
    function getTypeName(dependencies, typeInfo) {
      let schema = null;
      let typeName = null;

      if (!typeInfo) {
        return null;
      }

      if (typeInfo.type === 'array') {
        return CollectionType.collectionTypeName(getTypeName(dependencies, typeInfo.items));
      } if (typeInfo.oneOf) {
        return OneOfType.oneOfTypeName(typeInfo.oneOf.map(item => getTypeName(dependencies, item)));
      } if (typeInfo.type === 'object') {
        ({ schema } = typeInfo);
        // it's possible for the schema to be undefined, use 'object' type by default
        typeName = getSchemaFullName(schema || typeInfo);
      } else if (typeInfo.type === 'string' && typeInfo.enum) {
        // enum type is string, but we need to get a meanful name for different enum type
        // this is to help us disable cache accurately, as enum can be odata call return type now
        typeName = (typeInfo.$$ref || 'string').split('/').join('.');
      } else {
        // primitive types
        typeName = typeInfo.type;
      }

      if (schema) {
        dependencies.push(schema);
      }

      return typeName;
    }

    function defineCallableOnType(acts, funcs, type, qualifiedName, forEntityType = true) {
      const actions = [];
      const functions = [];

      function getCallableTypeName(key) {
        return `${key}##${qualifiedName}${forEntityType ? '' : '@@COLL'}`;
      }

      _.each(_.keys(acts), key => {
        const typeName = getCallableTypeName(key);
        const parameters = {};

        Object.keys(acts[key].Parameter || {}).forEach(k => {
          const parameter = acts[key].Parameter[k];
          parameters[k] = getTypeName([], parameter);
        });

        actions.push(new ActionType({
          name: typeName,
          callableName: key,
          parameters,
          returnTypeName: getTypeName([], acts[key].ReturnType),
        }));
      });

      _.each(_.keys(funcs), key => {
        const typeName = getCallableTypeName(key);
        const parameters = {};

        Object.keys(funcs[key].Parameter || {}).forEach(k => {
          const param = funcs[key].Parameter[k];
          parameters[k] = getTypeName([], param);
        });

        functions.push(new FunctionType({
          name: typeName,
          callableName: key,
          parameters,
          returnTypeName: getTypeName([], funcs[key].ReturnType),
        }));
      });

      defineConstProperty(type, 'callable', {
        actions,
        functions,
      });
    }

    /**
     * Define an entity type, and its dependencies
     *
     * @param {Schema} schema - The schema for the entity type
     * @param {string} [path] - Possible full path of the schema
     * @return {Void} Nothing to return
     */
    function defineSchemaType(schema, path) {
      const qualifiedName = getSchemaFullName(schema, path);

      if (!edm.types.resolve(qualifiedName)) {
        const dependencies = [];
        const properties = {};

        Object.keys(schema.properties || {}).forEach(key => {
          const typeInfo = schema.properties[key];
          properties[key] = {
            typeName: getTypeName(dependencies, typeInfo),
          };
        });

        const type = new EntityType({
          name: qualifiedName,
          baseTypeName: getSchemaBaseTypeName(schema) || 'object',
          key: getSchemaKey(schema),
          properties,
          navigationPropertyNames: getSchemaNavigationPropertyNames(schema),
        });

        defineConstProperty(type, 'schema', schema);

        _.each(dependencies, defineSchemaType);

        const entityActions = _.get(schema, '$$ODataExtension.Action', null);
        const entityFunctions = _.get(schema, '$$ODataExtension.Function', null);

        if (entityActions || entityFunctions) {
          defineCallableOnType(entityActions, entityFunctions, type, qualifiedName);
        }

        const collCallable = _.get(schema, '$$ODataExtension.Collection', null);

        if (collCallable) {
          defineCallableOnType(
            collCallable.Action,
            collCallable.Function,
            type.collectionType,
            qualifiedName,
            false,
          );
        }
      }
    }

    // Define all the primitive types
    _.each({
      string: String,
      integer: Number,
      number: Number,
      datetime: Date,
      boolean: Boolean,
      null: null,
    }, (jsType, name) => new PrimitiveType({ name, jsType }));

    // Define the base object type
    /* eslint no-new: 0 */
    new ComplexType({
      name: 'object',
      properties: {},
    });

    _.each(schemas, (schema, index) => {
      if (_.isString(index)) {
        defineSchemaType(schema, index);
      } else {
        defineSchemaType(schema);
      }
    });

    return _.chain({})
      .defineConstProperty('schemas', schemas)
      .defineConstProperty('namespace', namespace)
      .value();
  })());
};
