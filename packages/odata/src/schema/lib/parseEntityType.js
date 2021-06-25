const { parseObjectType } = require('./parseObjectType');

function parseEntityType({
  Key,
  ...rest
}, { isByDefaultNullable }) {
  const schema = parseObjectType(rest, { isByDefaultNullable });
  // There could be multiple keys
  if (Key) {
    schema.$$ODataExtension.Key = Key.map(({ PropertyRef: [{ $: { Name } }] }) => Name);
  }
  return schema;
}

exports.parseEntityType = parseEntityType;
