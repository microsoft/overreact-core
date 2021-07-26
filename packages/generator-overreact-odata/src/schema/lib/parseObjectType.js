/* eslint-disable no-restricted-syntax */
const { parseBoolean } = require('./parseBoolean');
const { parseTypeReference } = require('./parseTypeReference');

function parseObjectType({
  $: {
    Name, Abstract, BaseType, OpenType,
  },
  NavigationProperty,
  Property,
}, { isByDefaultNullable }) {
  const schema = {
    type: 'object',
    properties: {},
    $$ODataExtension: {
      Name,
    },
  };
  if (Abstract) {
    schema.$$ODataExtension.Abstract = parseBoolean(Abstract);
  }
  if (BaseType) {
    schema.$$ODataExtension.BaseType = parseTypeReference(BaseType, 'false', { isByDefaultNullable });
  }
  if (OpenType) {
    schema.$$ODataExtension.OpenType = parseBoolean(OpenType);
  }
  if (NavigationProperty) {
    schema.$$ODataExtension.NavigationProperty = NavigationProperty.map(({
      $: { Name: propertyName },
    }) => propertyName);
    for (const { $: { Name: propertyName, Type, Nullable } } of NavigationProperty) {
      schema.properties[propertyName] = parseTypeReference(Type, Nullable, { isByDefaultNullable });
    }
  }
  if (Property) {
    for (const { $: { Name: propertyName, Type, Nullable } } of Property) {
      schema.properties[propertyName] = parseTypeReference(Type, Nullable, { isByDefaultNullable });
    }
  }
  return schema;
}

exports.parseObjectType = parseObjectType;
