/* eslint-disable no-restricted-syntax */
const _ = require('lodash');

const urlRegex = /https?:\/\//;

function getBaseType(schema, name) {
  return _.get(schema[name], '$$ODataExtension.BaseType.$ref', null);
}

function getProperties(schema, name) {
  const { properties } = schema[name];
  const baseType = getBaseType(schema, name);

  if (_.isArray(baseType)) {
    const baseProperties = _.reduce(
      baseType,
      (memo, bType) => _.chain({})
        .merge(memo, getProperties(schema, bType))
        .omit(schema[bType].private)
        .value(),
      {},
    );

    return _.merge({}, baseProperties, properties);
  } if (baseType) {
    return _.chain({})
      .merge(getProperties(schema, baseType), properties)
      .omit(schema[baseType].private)
      .value();
  }

  return properties;
}

function getSchemaWithBaseTypeProperties(jsonSchema) {
  return _.mapValues(jsonSchema, (val, name) => {
    const baseType = getBaseType(jsonSchema, name);
    const schema = baseType ? _.mergeWith({}, {
      properties: getProperties(jsonSchema, name),
    }, jsonSchema[name], (objValue, srcValue, key) => {
      if (key === 'enum') {
        return srcValue;
      }

      return undefined;
    }) : jsonSchema[name];

    return schema;
  });
}

function replacer(schema, model) {
  if (!_.isObject(schema)) {
    return schema;
  }

  const extension = {};
  Object.entries(schema).forEach(([key, val]) => {
    const refSchemaName = val;
    if (key === '$ref') {
      if (!urlRegex.test(refSchemaName)) {
        // eslint-disable-next-line no-proto
        extension.__proto__ = model[refSchemaName];
      }
      if (/^Model\//.test(refSchemaName)) {
        extension.schema = model[refSchemaName];
      }
    }
    if (key === 'oneOf') {
      if (val[0]) {
        Object.setPrototypeOf(val[0], model[val[0].$ref]);

        Object.assign(extension, {
          nullable: true,
        });
      }
    }

    Object.assign(schema, { [key]: replacer(val, model) });
  });

  if (_.isArray(schema)) {
    return schema;
  }
  return Object.assign(
    schema,
    extension,
  );
}

function exportSchemaModel(namespaces) {
  const schemas = {};
  const model = {};

  for (const [key, value] of Object.entries(namespaces)) {
    Object.keys(value).forEach(name => {
      const schemaName = `${key}/${name}`;
      schemas[schemaName] = value[name];
    });
  }

  Object.keys(schemas).forEach(name => { model[name] = {}; });

  const schemaWithBaseTypeProperties = getSchemaWithBaseTypeProperties(schemas);

  Object.keys(schemaWithBaseTypeProperties).sort().forEach(name => {
    Object.assign(model[name], replacer(schemaWithBaseTypeProperties[name], model));
  });

  return model;
}

module.exports = {
  exportSchemaModel,
};
