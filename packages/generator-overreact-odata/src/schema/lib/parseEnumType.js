/* eslint-disable no-restricted-syntax */
const { parseBoolean } = require('./parseBoolean');
const { parseTypeReference } = require('./parseTypeReference');

function parseEnumType({
  $: { Name, UnderlyingType, IsFlags },
  Member,
}, {
  isByDefaultNullable,
  withEnumValue,
}) {
  const schema = {
    type: 'string',
    enum: Member.map(({ $: { Name: enumValue } }) => enumValue),
    $$ODataExtension: {
      Name,
    },
  };

  if (withEnumValue) {
    const memberValues = {};
    for (const { $: { Name: enumValue, Value } } of Member) {
      memberValues[enumValue] = Number.parseInt(Value, 10);
    }
    schema.$$ODataExtension.Value = memberValues;
  }

  if (UnderlyingType) {
    schema.$$ODataExtension.UnderlyingType = parseTypeReference(UnderlyingType, 'false', {
      isByDefaultNullable,
    });
  }

  if (IsFlags) {
    schema.$$ODataExtension.IsFlags = parseBoolean(IsFlags);
  }

  return schema;
}

exports.parseEnumType = parseEnumType;
